import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scenarios } from '../src/lib/fixtures';

vi.mock('server-only', () => ({}));
afterEach(() => vi.useRealTimers());
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('DEMO_MODE', 'true');
  vi.stubEnv('ENABLE_LIVE_AI', 'false');
});

function request(path: string, body: unknown, origin = 'http://localhost') {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  });
}
async function extract() {
  const route = await import('../src/app/api/profile/extract/route');
  const response = await route.POST(
    request('/api/profile/extract', { text: scenarios[0].text, locale: 'az' }),
  );
  return (await response.json()).data.profile;
}

describe('prototype API boundaries', () => {
  it('never auto-approves extracted profile claims', async () => {
    const profile = await extract();
    expect(profile.confirmed_at).toBeNull();
    expect(profile.claims.every((c: { user_approved: boolean }) => !c.user_approved)).toBe(true);
    expect(profile.claims.some((c: { text: string }) => c.text === profile.education)).toBe(true);
  });
  it('does not pretend to analyze arbitrary text in fixture mode', async () => {
    const route = await import('../src/app/api/profile/extract/route');
    const response = await route.POST(
      request('/api/profile/extract', { text: 'Arbitrary test input', locale: 'az' }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('DEMO_INPUT');
  });
  it('rejects cross-origin requests and unsupported payloads', async () => {
    const route = await import('../src/app/api/profile/extract/route');
    const body = { text: scenarios[0].text, locale: 'az' };
    expect(
      (await route.POST(request('/api/profile/extract', body, 'https://other.example'))).status,
    ).toBe(403);
    expect(
      (await route.POST(request('/api/profile/extract', { ...body, locale: 'xx' }))).status,
    ).toBe(400);
  });
  it('accepts loopback aliases only with the same port and protocol', async () => {
    const route = await import('../src/app/api/profile/extract/route');
    const body = { text: scenarios[0].text, locale: 'az' };
    expect(
      (await route.POST(request('/api/profile/extract', body, 'http://127.0.0.1'))).status,
    ).toBe(200);
    expect(
      (await route.POST(request('/api/profile/extract', body, 'http://127.0.0.1:3001'))).status,
    ).toBe(403);
    expect(
      (await route.POST(request('/api/profile/extract', body, 'https://127.0.0.1'))).status,
    ).toBe(403);
    expect((await route.POST(request('/api/profile/extract', body, 'null'))).status).toBe(403);
  });
  it('requires both profile confirmation and at least one approved claim for matching', async () => {
    const profile = await extract();
    const route = await import('../src/app/api/opportunities/match/route');
    expect((await route.POST(request('/api/opportunities/match', { profile }))).status).toBe(400);
    profile.confirmed_at = new Date().toISOString();
    expect((await route.POST(request('/api/opportunities/match', { profile }))).status).toBe(400);
    profile.claims[0].user_approved = true;
    const response = await route.POST(request('/api/opportunities/match', { profile }));
    const body = await response.json();
    expect(body.data.matches).toHaveLength(3);
    expect(body.data.mode).toBe('fixture');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('rejects unknown opportunity IDs and excludes unapproved claims from all documents', async () => {
    const profile = await extract();
    profile.confirmed_at = new Date().toISOString();
    profile.claims[0].user_approved = true;
    const route = await import('../src/app/api/package/generate/route');
    expect(
      (await route.POST(request('/api/package/generate', { profile, opportunity_id: 'invented' })))
        .status,
    ).toBe(400);
    const response = await route.POST(
      request('/api/package/generate', { profile, opportunity_id: null }),
    );
    const pack = (await response.json()).data;
    expect(pack.draft.resume.flatMap((c: { claim_ids: string[] }) => c.claim_ids)).toEqual([
      profile.claims[0].id,
    ]);
    expect(pack.draft.cv).toHaveLength(1);
    expect(pack.draft.letter).toEqual([]);
    expect(pack.opportunity_id).toBeNull();
    expect(pack.profile_revision).toBe(profile.revision);
  });
  it('keeps stale/expired live catalog separate from fixture recommendations', async () => {
    vi.setSystemTime(new Date('2030-01-01T12:00:00Z'));
    const profile = await extract();
    profile.confirmed_at = new Date().toISOString();
    profile.claims[0].user_approved = true;
    vi.stubEnv('DEMO_MODE', 'false');
    const route = await import('../src/app/api/opportunities/match/route');
    const body = await (await route.POST(request('/api/opportunities/match', { profile }))).json();
    expect(body.data.matches).toEqual([]);
    expect(body.data.catalog_status).toBe('empty_verified_catalog');
    const packages = await import('../src/app/api/package/generate/route');
    expect(
      (
        await packages.POST(
          request('/api/package/generate', { profile, opportunity_id: 'demo-ai' }),
        )
      ).status,
    ).toBe(400);
  });
  it('returns a safe configuration error without calling an external provider', async () => {
    vi.stubEnv('DEMO_MODE', 'false');
    vi.stubEnv('GEMINI_API_KEY', '');
    const route = await import('../src/app/api/profile/extract/route');
    const response = await route.POST(
      request('/api/profile/extract', { text: 'Synthetic profile test', locale: 'az' }),
    );
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('AI_NOT_CONFIGURED');
  });
});
