'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  Clock3,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  HandCoins,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Match, Profile, Opportunity } from '@/lib/schemas';
import { displayDateAz } from '@/lib/display-date';
import { deadlineNotice } from '@/lib/deadline-notice';

export const categoryLabels = {
  job: 'İş vakansiyası',
  scholarship: 'Təqaüd',
  grant: 'Qrant',
  internship: 'Təcrübə',
};
type Category = keyof typeof categoryLabels;
const categoryIcons = {
  job: BriefcaseBusiness,
  scholarship: GraduationCap,
  grant: HandCoins,
  internship: BriefcaseBusiness,
};

function deadlineLabel(opportunity: Opportunity) {
  if (opportunity.deadline.kind === 'rolling') return 'Davamlı qəbul';
  if (!opportunity.deadline.date) return 'Son tarix məlum deyil';
  return displayDateAz(opportunity.deadline.date);
}
function sourceText(ref: string, profile: Profile) {
  if (ref === 'education') return profile.education;
  if (ref === 'eligibility_notes') return profile.eligibility_notes;
  const [field, index] = ref.split('.');
  if (field === 'skills') return profile.skills[Number(index)];
  if (field === 'languages') return profile.languages?.[Number(index)];
  if (field === 'interests') return profile.interests?.[Number(index)];
  return profile.claims.find((claim) => ref === `claims.${claim.id}`)?.text;
}
function ScoreRing({ value, large = false }: { value: number | null; large?: boolean }) {
  return (
    <div
      className={`fit-ring ${large ? 'large' : ''}`}
      style={{ '--fit': `${value ?? 0}%` } as CSSProperties}
    >
      <div>
        <strong>{value === null ? '—' : `${value}%`}</strong>
        <small>uyğunluq</small>
      </div>
    </div>
  );
}

type Props = {
  profile: Profile;
  matches: Match[];
  excludedMatches: Match[];
  saved: string[];
  onSavedChange: (ids: string[]) => void;
  catalogCount: number;
  status: 'idle' | 'ready' | 'failed';
  fixture: boolean;
  busy: boolean;
  onEdit: () => void;
  onRetry: () => void;
  onGenerate: (id: string | null) => void;
};

export function OpportunityDashboard({
  profile,
  matches,
  excludedMatches,
  saved,
  onSavedChange: setSaved,
  catalogCount,
  status,
  fixture,
  busy,
  onEdit,
  onRetry,
  onGenerate,
}: Props) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('fit');
  const [savedOnly, setSavedOnly] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [page, setPage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const currentMatches = matches.filter(
    (match) => deadlineNotice(match.opportunity.deadline, now).state !== 'expired',
  );
  const currentExcluded = excludedMatches.filter(
    (match) => deadlineNotice(match.opportunity.deadline, now).state !== 'expired',
  );
  const best = currentMatches[0];
  const unresolved = [
    ...new Set(
      currentMatches
        .flatMap((match) =>
          match.rows
            .filter((row) => row.status === 'unknown')
            .map(
              (row) =>
                match.opportunity.requirements.find((r) => r.id === row.requirement_id)?.label,
            ),
        )
        .filter((label): label is string => Boolean(label)),
    ),
  ];
  const allShown = showExcluded ? [...currentMatches, ...currentExcluded] : currentMatches;
  const filtered = allShown.filter(
    (match) =>
      (category === 'all' || match.opportunity.category === category) &&
      (!savedOnly || saved.includes(match.opportunity.id)) &&
      `${match.opportunity.name} ${match.opportunity.organization} ${match.opportunity.description} ${(match.opportunity.tags ?? []).join(' ')}`
        .toLocaleLowerCase('az')
        .includes(query.toLocaleLowerCase('az')),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === 'date'
      ? (Date.parse(a.opportunity.deadline.instant ?? a.opportunity.deadline.date ?? '') ||
          Infinity) -
        (Date.parse(b.opportunity.deadline.instant ?? b.opportunity.deadline.date ?? '') ||
          Infinity)
      : Number(a.eligibility === 'ineligible') - Number(b.eligibility === 'ineligible') ||
        Number(a.eligibility === 'needs_clarification') -
          Number(b.eligibility === 'needs_clarification') ||
        (b.readiness ?? -1) - (a.readiness ?? -1),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / 3));
  const currentPage = Math.min(page, pages - 1);
  const visible = sorted.slice(currentPage * 3, currentPage * 3 + 3);
  const totalCount = currentMatches.length + currentExcluded.length;

  return (
    <section className="opportunity-dashboard no-print">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">02 / İMKANLAR</p>
          <h1 ref={heading} tabIndex={-1}>
            Sənə uyğun imkanlar
          </h1>
          <p>Tələbləri müqayisə et, bir imkan seç və müraciətə hazırlaş.</p>
        </div>
        <button className="button secondary" disabled={busy} onClick={onEdit}>
          <SlidersHorizontal size={17} /> Profili yenilə
        </button>
      </div>

      <div className="dashboard-overview">
        <section className="panel fit-overview">
          <div className="overview-title">
            <h2>Profilinə ən yaxın</h2>
          </div>
          <div className="overview-body">
            <ScoreRing value={best?.readiness ?? null} large />
            <div className="overview-facts">
              <strong>
                {best?.opportunity.name ??
                  (status === 'failed'
                    ? 'Analizi yenidən yoxla'
                    : status === 'ready'
                      ? 'Hazırda uyğun nəticə yoxdur'
                      : 'Profilin qiymətləndirilir')}
              </strong>
              <p>
                {best
                  ? `${best.met}/${best.total} tələb qarşılanır · ${best.unknown} tələb bilinmir`
                  : 'Nəticə yalnız elan tələbləri yoxlandıqdan sonra göstərilir.'}
              </p>
            </div>
          </div>
          <p className="fit-explanation">
            Faiz qarşılanan tələblərin payıdır, qəbul ehtimalı deyil. Naməlumlar ayrıca göstərilir.
          </p>
        </section>
      </div>

      <div className="dashboard-stats">
        <div>
          <ShieldCheck size={21} />
          <span>
            <strong>{status === 'ready' ? catalogCount : '—'}</strong>
            <small>{fixture ? 'nümunə elan' : 'aktual mənbəli elan'}</small>
          </span>
        </div>
        <div>
          <Check size={21} />
          <span>
            <strong>{status === 'ready' ? currentMatches.length : '—'}</strong>
            <small>müqayisə edilən imkan</small>
          </span>
        </div>
        <div>
          <CircleHelp size={21} />
          <span>
            <strong>{status === 'ready' ? unresolved.length : '—'}</strong>
            <small>dəqiqləşdiriləcək mövzu</small>
          </span>
        </div>
        <button
          onClick={() => {
            setSavedOnly(!savedOnly);
            setPage(0);
          }}
          aria-pressed={savedOnly}
        >
          <Bookmark size={21} />
          <span>
            <strong>{saved.length}</strong>
            <small>saxlanılan</small>
          </span>
        </button>
      </div>

      <div className="opportunity-toolbar" id="opportunities">
        <div className="section-heading">
          <div>
            <h2>İmkanları kəşf et</h2>
            <p>
              {fixture ? 'Açıq etiketli demo nəticələri' : 'Rəsmi mənbələr · profilə görə sıralama'}
            </p>
          </div>
          <button className="text-button" disabled={busy} onClick={onRetry}>
            Analizi yenilə
          </button>
        </div>
        <div className="opportunity-filters">
          <div className="category-filters" aria-label="İmkan növü">
            <button
              aria-pressed={category === 'all'}
              onClick={() => {
                setCategory('all');
                setPage(0);
              }}
            >
              Hamısı <span>{totalCount}</span>
            </button>
            {(Object.keys(categoryLabels) as Category[]).map((key) => (
              <button
                key={key}
                aria-pressed={category === key}
                onClick={() => {
                  setCategory(key);
                  setPage(0);
                }}
              >
                {categoryLabels[key]}{' '}
                <span>
                  {
                    [...currentMatches, ...currentExcluded].filter(
                      (m) => m.opportunity.category === key,
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          <div className="search-sort">
            <label className="opportunity-search">
              <Search size={18} />
              <input
                aria-label="İmkan axtar"
                placeholder="Ad, təşkilat və ya bacarıq…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
              />
            </label>
            <select
              aria-label="İmkanları sırala"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}
            >
              <option value="fit">Ən uyğun əvvəl</option>
              <option value="date">Son tarix əvvəl</option>
            </select>
          </div>
        </div>
        <div className="results-meta">
          <p role="status">
            {sorted.length} nəticədən {visible.length} imkan göstərilir
            {savedOnly ? ' · saxlanılanlar' : ''}
          </p>
          {currentExcluded.length > 0 && (
            <label>
              <input
                type="checkbox"
                checked={showExcluded}
                onChange={(event) => {
                  setShowExcluded(event.target.checked);
                  setPage(0);
                }}
              />{' '}
              Uyğunluq maneəsi olanları göstər ({currentExcluded.length})
            </label>
          )}
        </div>
      </div>

      {status === 'failed' ? (
        <div className="panel empty-state">
          <CircleHelp />
          <h3>Uyğunluq analizi tamamlanmadı</h3>
          <p>Profilin saxlanılıb. Analizi yeniləyə və ya CV ilə davam edə bilərsən.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="panel empty-state">
          <Search />
          <h3>{busy ? 'Tələblər müqayisə edilir…' : 'Bu seçimə uyğun nəticə yoxdur'}</h3>
          <p>Filtrləri dəyiş və ya profilində daha çox məlumat əlavə et.</p>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              setCategory('all');
              setQuery('');
              setSavedOnly(false);
              setPage(0);
            }}
          >
            Filtrləri təmizlə
          </button>
        </div>
      ) : null}

      <div className="match-card-grid">
        {visible.map((match) => {
          const opportunity = match.opportunity;
          const notice = deadlineNotice(opportunity.deadline, now);
          const Icon = categoryIcons[opportunity.category];
          const isSaved = saved.includes(opportunity.id);
          return (
            <article
              className={`panel match-card deadline-${notice.state} ${match.eligibility === 'ineligible' ? 'ineligible' : ''}`}
              key={opportunity.id}
            >
              {notice.text && (
                <p className={`deadline-alert ${notice.state}`} role="status">
                  <Clock3 size={17} />
                  {notice.text}
                </p>
              )}
              <div className="match-card-top">
                <span className={`opportunity-type ${opportunity.category}`}>
                  <Icon size={16} />
                  {categoryLabels[opportunity.category]}
                </span>
                <button
                  className="icon-button"
                  aria-label={`${opportunity.name} — ${isSaved ? 'saxlanılanlardan çıxar' : 'yadda saxla'}`}
                  aria-pressed={isSaved}
                  onClick={() =>
                    setSaved(
                      isSaved
                        ? saved.filter((id) => id !== opportunity.id)
                        : [...saved, opportunity.id],
                    )
                  }
                >
                  <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="match-card-title">
                <div>
                  <p>{opportunity.organization}</p>
                  <h3>{opportunity.name}</h3>
                  <small>{opportunity.location}</small>
                </div>
                <ScoreRing value={match.readiness} />
              </div>
              <p className="match-description">{opportunity.description}</p>
              <div className="match-tags">
                {(opportunity.tags ?? []).slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="match-benefit">
                {opportunity.benefit || 'Məlumat mənbədə göstərilir'}
              </div>
              <div className="match-counts">
                <span>
                  <Check size={15} />
                  {match.met} qarşılanır
                </span>
                <span>
                  <X size={15} />
                  {match.unmet} qarşılanmır
                </span>
                <span>
                  <CircleHelp size={15} />
                  {match.unknown} bilinmir
                </span>
              </div>
              {match.eligibility === 'ineligible' ? (
                <p className="eligibility-note blocked">
                  Məcburi uyğunluq şərti qarşılanmır. Tövsiyə edilən nəticə deyil.
                </p>
              ) : match.eligibility === 'needs_clarification' ? (
                <p className="eligibility-note">Məcburi uyğunluq şərtini dəqiqləşdir</p>
              ) : (
                <p className="eligibility-note eligible">Bəyanına görə əsas şərtlər qarşılanır</p>
              )}
              {!!match.blocking_requirement_ids.length && (
                <p className="blocker-note">
                  Vacib çatışmazlıq:{' '}
                  {match.blocking_requirement_ids
                    .map((id) => opportunity.requirements.find((r) => r.id === id)?.label)
                    .join('; ')}
                </p>
              )}
              <details className="match-analysis">
                <summary>
                  Uyğunluq niyə {match.readiness ?? '—'}%?{' '}
                  <span>{match.total} tələbin analizi</span>
                </summary>
                <ul className="requirement-list">
                  {match.rows.map((row) => (
                    <li key={row.requirement_id}>
                      {row.status === 'met' ? (
                        <Check className="met" size={17} />
                      ) : row.status === 'unmet' ? (
                        <X className="unmet" size={17} />
                      ) : (
                        <CircleHelp size={17} />
                      )}
                      <div>
                        <strong>
                          {opportunity.requirements.find((r) => r.id === row.requirement_id)?.label}
                        </strong>
                        <small className={`requirement-status ${row.status}`}>
                          {row.status === 'met'
                            ? 'Qarşılanır'
                            : row.status === 'unmet'
                              ? 'Qarşılanmır'
                              : 'Məlumat çatışmır'}
                        </small>
                        <small>{row.rationale}</small>
                        {row.profile_field_refs.length > 0 && (
                          <small>
                            Profil mənbəyi:{' '}
                            {row.profile_field_refs
                              .map((ref) => sourceText(ref, profile))
                              .filter(Boolean)
                              .join(' · ')}
                          </small>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="fit-explanation">
                  Hesab: {match.met} / {match.total} × 100 = {match.readiness ?? '—'}%. Öz bəyanına
                  əsaslanır; çatışmayan məlumat mənfi fakt sayılmır.
                </p>
              </details>
              <div className={`match-deadline deadline-${notice.state}`}>
                <CalendarDays size={17} />
                <span>
                  <strong>{deadlineLabel(opportunity)}</strong>
                  <small>
                    {opportunity.deadline.source_text ??
                      (opportunity.deadline.kind === 'rolling'
                        ? 'Sabit son tarix yoxdur'
                        : 'Mənbənin yerli vaxtını yoxla')}
                  </small>
                </span>
              </div>
              <div className="match-actions">
                <button
                  className="button primary"
                  disabled={busy || match.eligibility === 'ineligible'}
                  onClick={() => onGenerate(opportunity.id)}
                >
                  {fixture
                    ? 'Nümunə paketi yarat'
                    : opportunity.writing_policy === 'own_words'
                      ? 'Öz mətnin tələb olunur'
                      : 'Müraciətə hazırlaş'}
                  <ArrowRight size={16} />
                </button>
                {opportunity.source_url ? (
                  <a
                    className="source-link"
                    href={opportunity.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rəsmi elan
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <span className="source-link">Demo · real elan deyil</span>
                )}
              </div>
              {opportunity.writing_policy === 'disclose_ai' && (
                <p className="source-policy">
                  Ərizəni öz sözlərinlə yaz; AI yardımı və dialoq qeydləri açıqlanmalıdır.
                </p>
              )}
              <p className="match-verified">
                {opportunity.fixture
                  ? 'Sintetik nümunə'
                  : `Mənbə yoxlanılıb: ${displayDateAz(opportunity.verified_at!)}`}
              </p>
            </article>
          );
        })}
      </div>

      {pages > 1 && (
        <nav className="results-pagination" aria-label="Nəticə səhifələri">
          <button
            className="button secondary"
            disabled={currentPage === 0}
            onClick={() => {
              setPage(currentPage - 1);
              heading.current?.scrollIntoView({ block: 'start' });
            }}
          >
            Əvvəlki
          </button>
          <span>
            {currentPage + 1} / {pages}
          </span>
          <button
            className="button secondary"
            disabled={currentPage === pages - 1}
            onClick={() => {
              setPage(currentPage + 1);
              heading.current?.scrollIntoView({ block: 'start' });
            }}
          >
            Sonrakı
          </button>
        </nav>
      )}

      <div className="dashboard-bottom">
        <section className="panel next-questions">
          <h2>Çatışmayan məlumatlar</h2>
          <p>Bu məlumatlar tələb olunan yerdə fərq yaradır.</p>
          {unresolved.length ? (
            <ul>
              {unresolved.slice(0, 4).map((label) => (
                <li key={label}>
                  <CircleHelp size={17} />
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {status === 'ready'
                ? 'Mövcud analizdə naməlum tələb qalmayıb.'
                : 'Tələblər yoxlandıqdan sonra burada görünəcək.'}
            </p>
          )}
          <button className="text-button" disabled={busy} onClick={onEdit}>
            Profilimə məlumat əlavə et <ArrowRight size={16} />
          </button>
        </section>
        <section className="panel dashboard-cv">
          <span className="mini-icon">
            <GraduationCap size={24} />
          </span>
          <h2>Elan seçmədən də başla</h2>
          <p>Təsdiqlədiyin təcrübələrdən CV və resume hazırla.</p>
          <button className="button secondary" disabled={busy} onClick={() => onGenerate(null)}>
            Sadəcə CV hazırla
            <ArrowRight size={16} />
          </button>
          <small>Saxlanılan imkanlar yalnız bu açıq sessiyada qalır.</small>
        </section>
      </div>
    </section>
  );
}
