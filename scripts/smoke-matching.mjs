import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PILOT_TEST_URL || 'http://127.0.0.1:3000';
async function post(path, body) {
  const started = Date.now();
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55000),
  });
  const result = await response.json();
  assert.equal(response.status, 200, `${path}: ${result.error?.code ?? response.status}`);
  return { data: result.data, duration_ms: Date.now() - started };
}
await mkdir('tmp/ai', { recursive: true });
const extraction = await post('/api/profile/extract', {
  locale: 'az',
  text: 'Sintetik sınaq profilidir. Kompüter elmləri üzrə 3-cü kurs tam ştat tələbəsiyəm, 18 aydan çox təhsil almışam. Fransız vətəndaşıyam. Python və SQL bilirəm, Python ilə məlumat təhlili layihəsi hazırlamışam. Universitetim praktiki təcrübə keçməyi tələb edir. Komanda layihəsində ünsiyyət və əməkdaşlıq etmişəm. İngilis dilini B2 səviyyəsində bilirəm. Maraqlarım süni intellekt və robototexnikadır. Cenevrədə təcrübə proqramı ilə maraqlanıram.',
});
const student = extraction.data.profile;
assert.ok(student.interests?.length > 0);
assert.ok(student.languages?.length > 0);
assert.ok(!student.languages.some((language) => /frans|french/i.test(language)));
assert.ok(student.eligibility_notes?.length > 0);
assert.ok(student.claims.every((claim) => !claim.user_approved));
student.claims.forEach((claim) => {
  claim.user_approved = true;
});
student.confirmed_at = new Date().toISOString();
student.opportunity_types = [];
const company = {
  ...student,
  id: 'synthetic-company',
  education: '',
  eligibility_notes: '',
  languages: [],
  skills: ['Açıq mənbə AI prototipi'],
  interests: ['Sosial təsir', 'Süni intellekt'],
  opportunity_types: ['grant'],
  target_role: 'Startap qrantı',
  claims: [
    'UNICEF proqram ölkəsində qeydiyyatdan keçmiş özəl kommersiya texnologiya şirkətim var.',
    'Açıq mənbə AI prototipimiz həssas uşaqların təhsilinə dəstək verir və ilkin pilot nəticələrimiz var.',
    'Ölçülə bilən real-time data-nı açıq dashboardda paylaşırıq.',
  ].map((text, i) => ({ id: `company-${i}`, text, user_approved: true })),
};
const blocked = {
  ...company,
  id: 'synthetic-individual',
  claims: [
    {
      id: 'individual',
      text: 'Şirkətim yoxdur; qrant üçün fərdi şəxs kimi müraciət etmək istəyirəm.',
      user_approved: true,
    },
  ],
  skills: [],
  education: '',
  languages: [],
};
const nationality = {
  ...student,
  id: 'synthetic-nationality',
  eligibility_notes:
    'Azərbaycan vətəndaşıyam. 18 aydan çox təhsil almış tam ştat tələbəsiyəm. Universitet praktiki təcrübə tələb edir.',
  opportunity_types: ['internship'],
  claims: student.claims.filter((claim) => !/frans|french/iu.test(claim.text)),
};
for (const [id, profile] of [
  ['student', student],
  ['company', company],
  ['blocked', blocked],
  ['nationality', nationality],
]) {
  const result = await post('/api/opportunities/match', { profile });
  assert.equal(result.data.mode, 'live');
  assert.equal(result.data.catalog_status, 'verified_catalog');
  assert.ok(result.data.catalog_count >= 9);
  const { matches, excluded_matches } = result.data;
  assert.ok(matches.every((match) => match.eligibility !== 'ineligible'));
  for (const match of [...matches, ...excluded_matches]) {
    assert.equal(match.opportunity.fixture, false);
    assert.ok(match.opportunity.source_url.startsWith('https://'));
    assert.equal(match.readiness, Math.round((match.met / match.total) * 100));
    assert.equal(match.met + match.unmet + match.unknown, match.total);
    assert.equal(new Set(match.rows.map((row) => row.requirement_id)).size, match.total);
    assert.ok(
      match.rows
        .filter((row) => row.status !== 'unknown')
        .every((row) => row.profile_field_refs.length > 0),
    );
  }
  if (id === 'blocked') {
    assert.ok(!matches.some((match) => match.opportunity.id === 'unicef-venture-rolling'));
    assert.equal(
      excluded_matches.find((match) => match.opportunity.id === 'unicef-venture-rolling')
        ?.eligibility,
      'ineligible',
    );
  }
  if (id === 'nationality') {
    assert.ok(!matches.some((match) => match.opportunity.id === 'cern-technical-it-2027'));
    assert.ok(
      excluded_matches
        .find((match) => match.opportunity.id === 'cern-technical-it-2027')
        ?.blocking_requirement_ids.includes('ts-nationality'),
    );
  }
  if (id === 'company')
    assert.ok(matches.some((match) => match.opportunity.category === 'grant' && match.met >= 4));
  await writeFile(`tmp/ai/matching-${id}.json`, JSON.stringify({ profile, ...result }, null, 2));
  console.log(
    JSON.stringify({
      scenario: id,
      duration_ms: result.duration_ms,
      scores: [...matches, ...excluded_matches].map((match) => ({
        id: match.opportunity.id,
        score: match.readiness,
        eligibility: match.eligibility,
      })),
      checks: 'PASS',
    }),
  );
  if (id === 'student') {
    const target = matches.find((match) => match.opportunity.id === 'cern-technical-it-2027');
    assert.ok(target);
    const generated = await post('/api/package/generate', {
      profile,
      opportunity_id: target.opportunity.id,
    });
    const pack = generated.data;
    assert.equal(pack.mode, 'live');
    assert.equal(pack.opportunity_id, target.opportunity.id);
    assert.equal(pack.opportunity_source_url, target.opportunity.source_url);
    assert.equal(pack.opportunity_organization, target.opportunity.organization);
    assert.deepEqual(pack.opportunity_deadline, target.opportunity.deadline);
    assert.ok(pack.draft.letter.length > 0);
    const ids = new Set(profile.claims.map((claim) => claim.id));
    assert.ok(
      [...pack.draft.cv, ...pack.draft.resume, ...pack.draft.letter].every((entry) =>
        entry.claim_ids.every((id) => ids.has(id)),
      ),
    );
    await writeFile('tmp/ai/matching-package.json', JSON.stringify(pack, null, 2));
    console.log(
      JSON.stringify({
        scenario: 'targeted-package',
        duration_ms: generated.duration_ms,
        checks: 'PASS',
      }),
    );
  }
}
