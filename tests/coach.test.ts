import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const { structured } = vi.hoisted(() => ({ structured: vi.fn() }));
vi.mock('../src/lib/server/gemini', () => ({ structured, demoMode: () => false }));
import { POST } from '../src/app/api/coach/route';
import type { Profile } from '../src/lib/schemas';

const profile: Profile = {
  id: 'synthetic',
  revision: 2,
  locale: 'en',
  name: 'Test Candidate',
  target_role: 'Developer',
  education: '',
  skills: [],
  confirmed_at: '2026-10-09T12:00:00Z',
  missing_information: [],
  claims: [
    { id: 'approved', text: 'Built a Python API.', user_approved: true },
    { id: 'rejected', text: 'Invented qualification', user_approved: false },
  ],
};
const result = {
  summary: 'Preparation',
  questions: [
    {
      question: 'Explain your API.',
      why: 'Specific contribution',
      answer_outline: 'Describe the implementation.',
      claim_ids: ['approved'],
      requirement_ids: [],
    },
  ],
  improvements: [],
  missing_information: ['Project date?'],
  priorities: [],
};
const request = (body: unknown) =>
  new Request('http://localhost:3000/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  });
afterEach(() => {
  structured.mockReset();
  vi.useRealTimers();
});
describe('AI career coach boundaries', () => {
  it('requires profile and experience confirmation', async () => {
    const response = await POST(
      request({
        profile: { ...profile, confirmed_at: null },
        opportunity_id: null,
        mode: 'interview',
      }),
    );
    expect(response.status).toBe(400);
    expect(structured).not.toHaveBeenCalled();
  });
  it('sends only approved facts; practice drafts cannot add profile claims', async () => {
    structured.mockImplementation(async (_task, _prompt, _data, _schema, _locale, validate) => {
      validate({ ...result, questions: Array.from({ length: 5 }, () => result.questions[0]) });
      return result;
    });
    const response = await POST(
      request({
        profile,
        opportunity_id: null,
        mode: 'interview',
        question: 'API?',
        answer: 'I claim an unverified achievement.',
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.profile_revision).toBe(2);
    expect(body.data).not.toHaveProperty('profile');
    expect(structured.mock.calls[0][2].approved_claims).toEqual([
      { id: 'approved', text: 'Built a Python API.' },
    ]);
  });
  it('rejects fabricated or rejected claim IDs in coaching output', async () => {
    structured.mockImplementation(async (_task, _prompt, _data, _schema, _locale, validate) => {
      validate({ ...result, questions: [{ ...result.questions[0], claim_ids: ['rejected'] }] });
      return result;
    });
    expect((await POST(request({ profile, opportunity_id: null, mode: 'interview' }))).status).toBe(
      503,
    );
  });
  it('rejects unknown or expired opportunity IDs before a provider call', async () => {
    vi.setSystemTime(new Date('2030-01-01'));
    expect(
      (await POST(request({ profile, opportunity_id: 'cern-full-stack-2026', mode: 'roadmap' })))
        .status,
    ).toBe(400);
    expect(structured).not.toHaveBeenCalled();
  });
});
