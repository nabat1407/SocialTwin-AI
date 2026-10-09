// Read-only public API integration check. This sample is never a candidate claim.
import fs from 'node:fs/promises';
const base = process.env.PILOT_BASE_URL || 'http://127.0.0.1:3000';
const username = process.argv[2] || 'octocat';
const fullName = process.argv[3] || 'octocat/Hello-World';
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
const listing = await post('/api/github/repositories', { username, consent: true });
const repository = listing.repositories.find((repo) => repo.full_name === fullName);
if (!repository) throw new Error('Public sample not in server listing');
const result = await post('/api/github/analyze', {
  username,
  consent: true,
  repositories: [repository.full_name],
  locale: 'en',
});
const evidenceIds = new Set(result.evidence.map((item) => item.id));
if (result.claims.some((claim) => claim.evidence_ids.some((id) => !evidenceIds.has(id))))
  throw new Error('Invalid evidence attribution');
if (result.coverage.request_count > 25) throw new Error('GitHub read budget exceeded');
const record = {
  checked_at: new Date().toISOString(),
  listing_count: listing.repositories.length,
  coverage: result.coverage,
  evidence_count: result.evidence.length,
  draft_count: result.claims.length,
  warning_count: result.warnings.length,
  canonical_sources: result.evidence.every((item) =>
    item.source_url.startsWith(`https://github.com/${fullName}/`),
  ),
  candidate_claims_approved: 0,
};
console.log(JSON.stringify(record, null, 2));
await fs.mkdir('tmp/career-qa', { recursive: true });
await fs.writeFile('tmp/career-qa/public-github.json', JSON.stringify(record, null, 2));
