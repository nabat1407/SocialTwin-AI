import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const { structured } = vi.hoisted(() => ({ structured: vi.fn() }));
vi.mock('../src/lib/server/gemini', () => ({ structured }));
import {
  githubAnalysisRequest,
  repositoryRequest as githubRepositoriesRequest,
} from '../src/lib/github-contracts';
import {
  analyzePublicGithub,
  listPublicRepositories,
  validateGithubDraft,
} from '../src/lib/server/github';

const sha = 'a'.repeat(40);
const repo = (owner: string, extra = {}) => ({
  full_name: `${owner}/project`,
  private: false,
  fork: false,
  archived: false,
  description: 'Synthetic public test',
  default_branch: 'main',
  ...extra,
});
afterEach(() => {
  vi.unstubAllGlobals();
  structured.mockReset();
});
function mockApi(
  owner: string,
  options: { author?: string; failTree?: boolean; fork?: boolean; docsCommit?: boolean } = {},
) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    if (path.startsWith('/users/'))
      return Response.json([
        repo(owner, { fork: options.fork ?? false }),
        repo('outsider'),
        repo(owner, { private: true, full_name: `${owner}/private` }),
      ]);
    if (path.endsWith('/commits') && url.includes('author='))
      return Response.json([{ sha, author: { login: options.author ?? owner } }]);
    if (path.endsWith('/commits')) return Response.json([{ sha }]);
    if (path.includes('/git/trees/'))
      return options.failTree
        ? new Response('', { status: 429 })
        : Response.json({
            truncated: false,
            tree: [
              { path: 'src/main.ts', type: 'blob', size: 80 },
              { path: 'vendor/unsafe.ts', type: 'blob', size: 30 },
              { path: 'large.py', type: 'blob', size: 50000 },
            ],
          });
    if (path.includes('/contents/'))
      return Response.json({
        type: 'file',
        encoding: 'base64',
        content: Buffer.from('export const add = (a: number, b: number) => a + b;').toString(
          'base64',
        ),
        size: 80,
      });
    if (path.includes('/commits/'))
      return Response.json({
        author: { login: options.author ?? owner },
        files: [
          {
            filename: options.docsCommit ? 'README.md' : 'src/main.ts',
            patch: '+ export const add = () => 1;',
          },
        ],
      });
    throw new Error('Unexpected GitHub API path');
  });
  vi.stubGlobal('fetch', fetchMock);
  structured.mockImplementation(async (_task, _prompt, data, _schema, _locale, validate) => {
    const value = {
      claims: [
        {
          text: 'Synthetic addition implementation',
          evidence_ids: [data.evidence[0].id],
          skills: ['TypeScript'],
          contribution_question: 'Did you implement this function?',
        },
      ],
    };
    validate(value);
    return value;
  });
  return fetchMock;
}
describe('bounded public GitHub evidence', () => {
  it('requires explicit consent and rejects URLs, traversal and more than three repositories', () => {
    expect(
      githubRepositoriesRequest.safeParse({ username: 'person', consent: false }).success,
    ).toBe(false);
    expect(
      githubRepositoriesRequest.safeParse({ username: 'https://evil.test', consent: true }).success,
    ).toBe(false);
    expect(
      githubAnalysisRequest.safeParse({
        username: 'person',
        consent: true,
        repositories: ['../private'],
        locale: 'az',
      }).success,
    ).toBe(false);
    expect(
      githubAnalysisRequest.safeParse({
        username: 'person',
        consent: true,
        repositories: ['p/a', 'p/b', 'p/c', 'p/d'],
        locale: 'az',
      }).success,
    ).toBe(false);
  });
  it('lists only public account repositories and caches bounded listings', async () => {
    const fetchMock = mockApi('listing-test');
    const first = await listPublicRepositories('listing-test');
    expect(first.repositories).toHaveLength(1);
    expect((await listPublicRepositories('listing-test')).cached).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/^https:\/\/api.github.com\//);
  });
  it('rejects unlisted/private repositories before reading their content', async () => {
    const fetchMock = mockApi('scope-test');
    await expect(
      analyzePublicGithub('scope-test', ['scope-test/private'], 'az'),
    ).rejects.toMatchObject({ code: 'INVALID_REPOSITORY' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('uses immutable source links, skips vendor/large files, reports fork limits and does not approve facts', async () => {
    const fetchMock = mockApi('evidence-test', { fork: true });
    const result = await analyzePublicGithub('evidence-test', ['evidence-test/project'], 'az');
    expect(result.coverage.files_sampled).toBe(1);
    expect(result.coverage.linked_commits).toBe(1);
    expect(result.coverage.request_count).toBeLessThanOrEqual(25);
    expect(result.warnings.some((w) => w.includes('fork'))).toBe(true);
    expect(result.evidence[0].source_url).toContain(`/blob/${sha}/src/main.ts`);
    expect(result.evidence[1].attribution).toBe('linked_commit');
    expect(fetchMock.mock.calls.some(([url]) => url.includes('/contents/vendor/'))).toBe(false);
    expect(result.claims[0]).not.toHaveProperty('user_approved');
  });
  it('does not attribute a commit whose author account differs', async () => {
    mockApi('author-test', { author: 'another-account' });
    const result = await analyzePublicGithub('author-test', ['author-test/project'], 'en');
    expect(result.coverage.linked_commits).toBe(0);
    expect(result.evidence.every((e) => e.attribution === 'limited')).toBe(true);
    expect(result.warnings.some((w) => w.includes('töhfənin olmadığı demək deyil'))).toBe(true);
  });
  it('reports limited attribution when the sampled author commit contains only documentation', async () => {
    mockApi('docs-commit-test', { docsCommit: true });
    const result = await analyzePublicGithub(
      'docs-commit-test',
      ['docs-commit-test/project'],
      'az',
    );
    expect(result.coverage.linked_commits).toBe(0);
    expect(result.coverage.partial).toBe(true);
    expect(result.evidence.every((item) => item.attribution === 'limited')).toBe(true);
    expect(result.warnings.some((warning) => warning.includes('diff-i yoxdur'))).toBe(true);
  });
  it('shows rate-limited partial coverage, rather than a fabricated empty-skill judgement', async () => {
    const fetchMock = mockApi('partial-test', { failTree: true });
    const result = await analyzePublicGithub('partial-test', ['partial-test/project'], 'az');
    expect(result.coverage.partial).toBe(true);
    expect(result.coverage.repositories_scanned).toBe(0);
    expect(result.claims).toEqual([]);
    expect(structured).not.toHaveBeenCalled();
    const requestsBefore = fetchMock.mock.calls.length;
    await analyzePublicGithub('partial-test', ['partial-test/project'], 'az');
    expect(fetchMock.mock.calls).toHaveLength(requestsBefore);
  });
  it('rejects invented evidence references', () => {
    expect(() =>
      validateGithubDraft(
        {
          claims: [
            {
              text: 'fake',
              skills: [],
              contribution_question: 'Confirm?',
              evidence_ids: ['invented'],
            },
          ],
        },
        [],
      ),
    ).toThrow('Unknown GitHub evidence ID');
  });
});
