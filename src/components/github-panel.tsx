'use client';
import { useState } from 'react';
import { GitBranch, ExternalLink, Check, LoaderCircle } from 'lucide-react';
import type { GitHubAnalysis, PublicRepository, GitHubEvidence } from '@/lib/github-contracts';
import type { Locale } from '@/lib/schemas';

type Props = {
  locale: Locale;
  disabled?: boolean;
  onAdd: (text: string, skills: string[], sources: GitHubEvidence[]) => boolean;
};
async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55000),
  });
  const result = await response.json();
  if (!response.ok || !result.ok)
    throw new Error(result.error?.message ?? 'GitHub baxışı tamamlanmadı.');
  return result.data;
}
export function GitHubPanel({ locale, disabled = false, onAdd }: Props) {
  const [username, setUsername] = useState('');
  const [consent, setConsent] = useState(false);
  const [repos, setRepos] = useState<PublicRepository[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [listed, setListed] = useState(false);
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState<number[]>([]);
  const [added, setAdded] = useState<number[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  async function list() {
    setBusy('Layihələr alınır…');
    setError('');
    setAnalysis(null);
    setSelected([]);
    setAdded([]);
    setConfirmed([]);
    setEdits({});
    try {
      const result = await post<{ repositories: PublicRepository[]; has_more: boolean }>(
        '/api/github/repositories',
        { username, consent },
      );
      setRepos(result.repositories);
      setHasMore(result.has_more);
      setListed(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Bağlantı alınmadı.');
    } finally {
      setBusy('');
    }
  }
  async function analyze() {
    setBusy('Seçilmiş fayl və töhfələr yoxlanılır…');
    setError('');
    setAnalysis(null);
    setAdded([]);
    setConfirmed([]);
    setEdits({});
    try {
      setAnalysis(
        await post<GitHubAnalysis>('/api/github/analyze', {
          username,
          repositories: selected,
          consent,
          locale,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Baxış alınmadı.');
    } finally {
      setBusy('');
    }
  }
  return (
    <section className="feature-panel github-panel" aria-labelledby="github-heading">
      <div className="feature-heading">
        <GitBranch size={20} />
        <div>
          <h2 id="github-heading">GitHub layihələrin</h2>
          <p>İstəyə bağlı · public layihələrdən konkret töhfə nümunələri</p>
        </div>
      </div>
      <label htmlFor="github-username">GitHub istifadəçi adın</label>
      <div className="feature-input-row">
        <input
          id="github-username"
          value={username}
          placeholder="istifadəçi-adı"
          disabled={Boolean(busy) || disabled}
          onChange={(e) => {
            setUsername(e.target.value);
            setListed(false);
            setAnalysis(null);
          }}
        />
        <button
          className="secondary"
          disabled={!consent || !username.trim() || Boolean(busy) || disabled}
          onClick={() => void list()}
        >
          Layihələri göstər
        </button>
      </div>
      <label className="feature-checkbox">
        <input
          type="checkbox"
          checked={consent}
          disabled={Boolean(busy) || disabled}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Bu hesabın mənə aid olduğunu bildirirəm; seçdiyim public faylların Gemini ilə təhlilinə
        razıyam.
      </label>
      <p className="feature-note">
        Repo sahibi olmaq müəlliflik sübutu deyil. GitHub olmadan da davam edə bilərsən.
      </p>
      {busy && (
        <p role="status">
          <LoaderCircle size={16} className="spinning" /> {busy}
        </p>
      )}
      {error && (
        <p className="feature-error" role="alert">
          {error}
        </p>
      )}
      {listed && !repos.length && <p>Public layihə tapılmadı. Təcrübələrini özün yaza bilərsən.</p>}
      {listed && repos.length > 0 && (
        <div className="github-repos">
          <p>
            Ən çox 3 layihə seç · {repos.length} repo göstərilir
            {hasMore ? ' · ilk 20 repo ilə məhdud baxış' : ''}
          </p>
          {repos.map((repo) => (
            <label key={repo.full_name} className="github-repo">
              <input
                type="checkbox"
                checked={selected.includes(repo.full_name)}
                disabled={
                  Boolean(busy) ||
                  disabled ||
                  (!selected.includes(repo.full_name) && selected.length >= 3)
                }
                onChange={(e) => {
                  setSelected(
                    e.target.checked
                      ? [...selected, repo.full_name]
                      : selected.filter((name) => name !== repo.full_name),
                  );
                  setAnalysis(null);
                }}
              />
              <span>
                <strong>{repo.full_name}</strong>
                <small>
                  {repo.description || 'Təsvir yoxdur'}
                  {repo.fork ? ' · Fork' : ''}
                  {repo.archived ? ' · Arxiv' : ''}
                </small>
              </span>
            </label>
          ))}
          <button
            className="primary"
            disabled={!consent || !selected.length || Boolean(busy) || disabled}
            onClick={() => void analyze()}
          >
            Seçilmiş layihələri təhlil et
          </button>
        </div>
      )}
      {analysis && (
        <div className="github-analysis">
          <p className="feature-note">
            {analysis.coverage.repositories_scanned}/{analysis.coverage.repositories_requested}{' '}
            layihə · {analysis.coverage.files_sampled} fayl nümunəsi ·{' '}
            {analysis.coverage.linked_commits} hesaba bağlı commit baxışı. Bütün GitHub tarixçəsi
            taranmayıb.
          </p>
          {analysis.warnings.length > 0 && (
            <details>
              <summary>Baxışın məhdudiyyətləri ({analysis.warnings.length})</summary>
              <ul>
                {analysis.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </details>
          )}
          {!analysis.claims.length && (
            <p>
              CV-yə əlavə ediləcək konkret maddə çıxarılmadı. Layihədə etdiyin işi öz sözlərinlə
              əlavə et.
            </p>
          )}
          {analysis.claims.map((claim, i) => (
            <article className="github-claim" key={i}>
              <label htmlFor={`github-claim-${i}`}>Töhfə maddəsini yoxla</label>
              <textarea
                id={`github-claim-${i}`}
                value={edits[i] ?? claim.text}
                disabled={added.includes(i) || disabled}
                maxLength={700}
                onChange={(e) => {
                  setEdits({ ...edits, [i]: e.target.value });
                  setConfirmed(confirmed.filter((id) => id !== i));
                }}
              />
              <div className="github-sources">
                {claim.evidence_ids.map((id) => {
                  const source = analysis.evidence.find((item) => item.id === id);
                  return (
                    source && (
                      <a key={id} href={source.source_url} target="_blank" rel="noreferrer">
                        {source.repository} · {source.path} <ExternalLink size={12} />
                      </a>
                    )
                  );
                })}
              </div>
              <p>{claim.contribution_question}</p>
              <p className="feature-note">
                Təsdiqlənəcək bacarıqlar: {claim.skills.join(', ') || 'əlavə bacarıq yoxdur'}
              </p>
              <label className="feature-checkbox">
                <input
                  type="checkbox"
                  checked={confirmed.includes(i)}
                  disabled={added.includes(i) || disabled}
                  onChange={(e) =>
                    setConfirmed(
                      e.target.checked ? [...confirmed, i] : confirmed.filter((id) => id !== i),
                    )
                  }
                />
                Bu hissəyə öz töhfəmi və maddənin doğruluğunu təsdiqləyirəm.
              </label>
              <button
                className="secondary"
                disabled={
                  !consent ||
                  !confirmed.includes(i) ||
                  added.includes(i) ||
                  !(edits[i] ?? claim.text).trim() ||
                  disabled
                }
                onClick={() => {
                  if (
                    onAdd(
                      (edits[i] ?? claim.text).trim(),
                      claim.skills,
                      analysis.evidence.filter((item) => claim.evidence_ids.includes(item.id)),
                    )
                  )
                    setAdded([...added, i]);
                }}
              >
                {added.includes(i) ? (
                  <>
                    <Check size={16} /> Profilə əlavə olundu
                  </>
                ) : (
                  'Profilə əlavə et'
                )}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
