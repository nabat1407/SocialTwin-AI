import assert from 'node:assert/strict';

const base = process.env.PILOT_TEST_URL || 'http://127.0.0.1:3000';
const examples = [
  'Kompüter elmləri üzrə 3-cü kurs tələbəsiyəm. Python və SQL bilirəm. Python ilə məlumat təhlili layihəsi hazırlamışam. AI sahəsində təcrübə proqramı axtarıram.',
  'İqtisadiyyat üzrə 4-cü kurs tələbəsiyəm. Excel və məlumat təhlili bilirəm. Universitetdə iqtisadi araşdırma layihəsində iştirak etmişəm. Beynəlxalq təqaüd axtarıram.',
  'Satış sahəsində çalışmışam. Müştərilərlə ünsiyyət və Excel bacarıqlarım var. SQL öyrənirəm. Junior data analyst vəzifəsi üçün CV hazırlamaq istəyirəm.',
];
async function post(path, body) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, result: await response.json() };
}
for (const [i, text] of examples.entries()) {
  const extracted = await post('/api/profile/extract', { text, locale: 'az' });
  assert.equal(extracted.status, 200);
  assert.equal(extracted.result.data.mode, 'fixture');
  const profile = extracted.result.data.profile;
  assert.equal(profile.confirmed_at, null);
  assert.ok(profile.claims.every((c) => !c.user_approved));
  const rejected = await post('/api/package/generate', { profile, opportunity_id: null });
  assert.equal(rejected.status, 400);
  profile.confirmed_at = new Date().toISOString();
  profile.claims[0].user_approved = true;
  const matches = await post('/api/opportunities/match', { profile });
  assert.equal(matches.status, 200);
  assert.ok(matches.result.data.matches.length <= 3);
  const generated = await post('/api/package/generate', {
    profile,
    opportunity_id: i === 2 ? null : matches.result.data.matches[0].opportunity.id,
  });
  assert.equal(generated.status, 200);
  const pack = generated.result.data;
  assert.ok(
    [...pack.draft.resume, ...pack.draft.cv].every((e) =>
      e.claim_ids.every((id) => id === profile.claims[0].id),
    ),
  );
  if (i === 2) assert.equal(pack.draft.letter.length, 0);
  const invalid = await post('/api/package/generate', {
    profile,
    opportunity_id: 'invented-opportunity',
  });
  assert.equal(invalid.status, 400);
  console.log(
    `Scenario ${i + 1}: extraction → confirmation gate → match → package → invalid ID rejection PASS`,
  );
}
const invalidInput = await post('/api/profile/extract', {
  text: 'Different user input requiring live AI',
  locale: 'az',
});
assert.equal(invalidInput.status, 400);
console.log('Fixture does not pretend to analyse arbitrary input PASS');
