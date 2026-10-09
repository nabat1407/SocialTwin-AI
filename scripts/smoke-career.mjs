// Opt-in live test: public GitHub reads and Gemini calls; synthetic profile only.
// Run against an already configured local dev server. Does not read or print keys.
import fs from 'node:fs/promises';
const base = process.env.PILOT_BASE_URL || 'http://127.0.0.1:3000';
async function post(path, data) {
  const started = Date.now();
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(55000),
  });
  const result = await response.json();
  console.log(path, response.status, Date.now() - started, 'ms', result.error?.code || 'OK');
  if (!response.ok || !result.ok) throw new Error(result.error?.code || 'API failed');
  return result.data;
}
const profile = {
  id: 'synthetic-career-smoke',
  revision: 1,
  locale: 'en',
  name: 'Test Candidate',
  target_role: 'Software Developer',
  education: 'BSc Computer Science, Example University, 2024–present',
  skills: ['Python', 'TypeScript', 'React', 'SQL'],
  languages: ['English B2'],
  interests: ['Open source', 'Web development'],
  eligibility_notes:
    'Full-time BSc student. Completed 24 months of studies. French citizen. No registered company.',
  opportunity_types: [],
  confirmed_at: new Date().toISOString(),
  missing_information: [],
  contact: { email: 'test@example.test', phone: '', website: '' },
  claims: [
    {
      id: 'edu',
      text: 'BSc Computer Science, Example University, 2024–present; full-time student; completed 24 months.',
      user_approved: true,
    },
    {
      id: 'api',
      text: 'Built a Python FastAPI project API with SQL queries during a university course in 2025; implemented input validation and unit tests. No measured business impact.',
      user_approved: true,
    },
    {
      id: 'web',
      text: 'Developed React and TypeScript screens for a volunteer community directory in 2026; implemented responsive forms and keyboard navigation.',
      user_approved: true,
    },
    { id: 'language', text: 'English B2; French citizen.', user_approved: true },
  ],
};
const matched = await post('/api/opportunities/match', { profile });
console.log(
  'Catalog/analyzed/recommended/excluded',
  matched.catalog_count,
  matched.analyzed_count,
  matched.matches.length,
  matched.excluded_matches.length,
  'warnings',
  matched.warnings?.length || 0,
);
if (matched.catalog_count !== 9) throw new Error('Expanded catalog missing');
const pack = await post('/api/package/generate', { profile, opportunity_id: null });
if ([...pack.draft.resume, ...pack.draft.cv].some((e) => !e.section))
  throw new Error('Missing professional sections');
console.log(
  'Resume/CV sections',
  [...new Set(pack.draft.resume.map((e) => e.section))],
  [...new Set(pack.draft.cv.map((e) => e.section))],
);
const review = await post('/api/coach', {
  profile,
  opportunity_id: null,
  mode: 'review',
  document: pack.draft.resume.map((e) => e.text).join('\n'),
});
const interview = await post('/api/coach', { profile, opportunity_id: null, mode: 'interview' });
const roadmap = await post('/api/coach', { profile, opportunity_id: null, mode: 'roadmap' });
console.log(
  'Coaching review/interview/roadmap',
  review.result.improvements.length,
  interview.result.questions.length,
  roadmap.result.priorities.length,
);
await fs.mkdir('tmp/career-qa', { recursive: true });
await fs.writeFile(
  'tmp/career-qa/live-synthetic.json',
  JSON.stringify({ profile, matched, pack, review, interview, roadmap }, null, 2),
);
if (process.argv.includes('--skip-github')) process.exit(0);
const listing = await post('/api/github/repositories', { username: 'octocat', consent: true });
const chosen =
  listing.repositories.find((repo) => repo.full_name === 'octocat/Hello-World') ||
  listing.repositories[0];
const github = chosen
  ? await post('/api/github/analyze', {
      username: 'octocat',
      consent: true,
      repositories: [chosen.full_name],
      locale: 'en',
    })
  : null;
console.log('Public technical GitHub check', github?.coverage, 'drafts', github?.claims.length);
// Public source sample is never approved or inserted into this synthetic profile.
await fs.mkdir('tmp/career-qa', { recursive: true });
await fs.writeFile(
  'tmp/career-qa/live-synthetic.json',
  JSON.stringify({ profile, matched, pack, review, interview, roadmap, github }, null, 2),
);
