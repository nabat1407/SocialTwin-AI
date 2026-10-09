'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCheck,
  FileText,
  GraduationCap,
  Layers,
  Download,
  CircleHelp,
  RotateCcw,
  Printer,
  ShieldCheck,
  BriefcaseBusiness,
  Plus,
  Trash2,
  UserRound,
  Search,
  Files,
  Check,
  LockKeyhole,
  PencilLine,
  GitBranch,
} from 'lucide-react';
import { scenarios } from '@/lib/fixtures';
import type { Locale, Match, Package, Profile } from '@/lib/schemas';
import { exportText, formatDocument, type DocumentKind } from '@/lib/documents';
import { OpportunityDashboard, categoryLabels } from './opportunity-dashboard';
import { displayDateAz } from '@/lib/display-date';
import { PilotMark } from './pilot-mark';
import { GitHubPanel } from './github-panel';
import { AiCoach } from './ai-coach';
import { DocumentPreview } from './document-preview';
import { WelcomeIntro } from './welcome-intro';
import type { GitHubEvidence } from '@/lib/github-contracts';
import {
  ProfileComposer,
  StoryPreview,
  composeStory,
  emptyStory,
  type StoryFields,
} from './profile-composer';

type Props = { mode: 'fixture' | 'live'; liveReady: boolean };

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    throw new Error(
      'Bağlantı kəsildi və ya sorğu vaxtı bitdi. Məlumatların saxlanılır; yenidən yoxla.',
    );
  }
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error?.message || 'Sorğu tamamlanmadı.');
  return result.data as T;
}

export function PilotApp({ mode, liveReady }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const step = pathname === '/imkanlar' ? 2 : pathname === '/senedler' ? 3 : 1;
  const routeRef = useRef(pathname);
  function setStep(next: number) {
    const route = ['', '/profil', '/imkanlar', '/senedler'][next];
    if (route && route !== pathname) router.push(route);
  }
  const [text, setText] = useState<string>(mode === 'fixture' ? scenarios[0].text : '');
  const [inputMode, setInputMode] = useState<'guided' | 'free'>(
    mode === 'fixture' ? 'free' : 'guided',
  );
  const [storyFields, setStoryFields] = useState<StoryFields>(emptyStory);
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [paperTemplate, setPaperTemplate] = useState<'modern' | 'classic'>('modern');
  const profileInput = inputMode === 'guided' ? composeStory(storyFields) : text;
  const inputLength =
    inputMode === 'guided'
      ? Object.values(storyFields).join(' ').trim().length
      : text.trim().length;
  const [locale, setLocale] = useState<Locale>('az');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [excludedMatches, setExcludedMatches] = useState<Match[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [catalogCount, setCatalogCount] = useState(0);
  const [matchWarnings, setMatchWarnings] = useState<string[]>([]);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'ready' | 'failed'>('idle');
  const [pack, setPack] = useState<Package | null>(null);
  const [document, setDocument] = useState('');
  const [tab, setTab] = useState<DocumentKind>('resume');
  const [approvedDocument, setApprovedDocument] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [manualClaim, setManualClaim] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [languagesText, setLanguagesText] = useState('');
  const [edits, setEdits] = useState<Partial<Record<DocumentKind, string>>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const review = useRef<HTMLElement>(null);
  useEffect(() => {
    if (profile?.id) {
      review.current?.scrollIntoView({ block: 'start' });
      review.current?.focus();
    }
  }, [profile?.id]);
  const selectedOpportunity = matches.find(
    (match) => match.opportunity.id === pack?.opportunity_id,
  )?.opportunity;
  const selectedDeadline = pack?.opportunity_deadline ?? selectedOpportunity?.deadline;
  useEffect(() => {
    routeRef.current = pathname;
    heading.current?.focus();
  }, [step, pathname]);
  useEffect(() => {
    if (step === 2 && !profile?.confirmed_at) router.replace('/profil');
    else if (step === 3 && (!pack || !profile))
      router.replace(profile?.confirmed_at ? '/imkanlar' : '/profil');
  }, [step, profile, pack, router]);

  function resetDerived() {
    setMatches([]);
    setExcludedMatches([]);
    setSavedIds([]);
    setCatalogCount(0);
    setMatchWarnings([]);
    setMatchStatus('idle');
    setPack(null);
    setEdits({});
    setDocument('');
    setApprovedDocument(false);
  }
  function editProfile(change: Partial<Profile>) {
    if (!profile) return;
    setProfile({ ...profile, ...change, revision: profile.revision + 1, confirmed_at: null });
    resetDerived();
  }
  function addGitHubClaim(text: string, skills: string[], sources: GitHubEvidence[]) {
    if (!profile || profile.claims.length >= 20) {
      setError('Profilində ən çox 20 təcrübə maddəsi ola bilər.');
      return false;
    }
    const mergedSkills = [...new Set([...profile.skills, ...skills])].slice(0, 20);
    editProfile({
      claims: [...profile.claims, { id: crypto.randomUUID(), text, user_approved: true, sources }],
      skills: mergedSkills,
    });
    setSkillsText(mergedSkills.join(', '));
    return true;
  }
  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Xəta baş verdi.');
    } finally {
      setBusy('');
    }
  }
  async function extract() {
    await run('Profil hazırlanır…', async () => {
      const result = await post<{ profile: Profile }>('/api/profile/extract', {
        text: profileInput,
        locale,
      });
      setProfile(result.profile);
      setSkillsText(result.profile.skills.join(', '));
      setInterestsText(result.profile.interests?.join(', ') ?? '');
      setLanguagesText(result.profile.languages?.join(', ') ?? '');
      setManualClaim('');
      setShowStoryEditor(false);
      resetDerived();
    });
  }
  function manualProfile() {
    setShowStoryEditor(false);
    setProfile({
      id: crypto.randomUUID(),
      revision: 1,
      locale,
      name: '',
      target_role: null,
      education: '',
      interests: [],
      languages: [],
      location: '',
      opportunity_types: ['job', 'scholarship', 'grant', 'internship'],
      skills: [],
      claims: [],
      confirmed_at: null,
      missing_information: [],
    });
    setSkillsText('');
    setInterestsText('');
    setLanguagesText('');
    setManualClaim('');
    setError('');
    resetDerived();
  }
  async function confirm() {
    if (!profile || !profile.claims.some((c) => c.user_approved)) {
      setError('Ən azı bir təcrübə maddəsini təsdiqləyin.');
      return;
    }
    const confirmed = { ...profile, confirmed_at: new Date().toISOString() };
    setMatches([]);
    setExcludedMatches([]);
    setCatalogCount(0);
    setMatchWarnings([]);
    setMatchStatus('idle');
    setProfile(confirmed);
    setStep(2);
    await run('İmkanlar müqayisə edilir…', async () => {
      try {
        const result = await post<{
          matches: Match[];
          excluded_matches: Match[];
          catalog_count: number;
          warnings?: string[];
        }>('/api/opportunities/match', { profile: confirmed });
        setMatches(result.matches);
        setExcludedMatches(result.excluded_matches);
        setCatalogCount(result.catalog_count);
        setMatchWarnings(result.warnings ?? []);
        setMatchStatus('ready');
      } catch (cause) {
        setMatchStatus('failed');
        throw cause;
      }
    });
  }
  async function generate(opportunityId: string | null) {
    if (!profile) return;
    const startedRoute = pathname;
    if (
      pack &&
      pack.profile_revision === profile.revision &&
      pack.opportunity_id === opportunityId
    ) {
      setStep(3);
      return;
    }
    await run('Hazırlıq paketi hazırlanır…', async () => {
      const result = await post<Package>('/api/package/generate', {
        profile,
        opportunity_id: opportunityId,
      });
      setPack(result);
      setEdits({});
      setTab('resume');
      setDocument(formatDocument(profile, result, 'resume'));
      setApprovedDocument(false);
      if (routeRef.current === startedRoute) setStep(3);
    });
  }
  function switchTab(next: DocumentKind) {
    if (!pack || !profile || next === tab) return;
    // Retain edits for each document instead of overwriting when switching tabs.
    setEdits((previous) => ({ ...previous, [tab]: document }));
    setDocument(edits[next] ?? formatDocument(profile, pack, next));
    setTab(next);
    setApprovedDocument(false);
  }
  function download() {
    if (!pack || !approvedDocument || !document.trim()) return;
    const blob = new Blob([exportText(pack, document)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = `socialtwin-${tab}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function downloadPdf() {
    if (!pack || !profile || !approvedDocument || !document.trim() || busy) return;
    await run('PDF hazırlanır', async () => {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          text: document,
          name: profile.name,
          locale: profile.locale,
          kind: tab,
          template: paperTemplate,
          approved: true,
          demo: pack.mode === 'fixture',
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message ?? 'PDF hazırlanmadı. Yenidən yoxla.');
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = `socialtwin-${tab}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  function reset() {
    setStep(1);
    setText('');
    setStoryFields(emptyStory);
    setInputMode('guided');
    setShowStoryEditor(false);
    setLocale('az');
    setProfile(null);
    setManualClaim('');
    setSkillsText('');
    setInterestsText('');
    setLanguagesText('');
    resetDerived();
    setError('');
  }

  return (
    <>
      <a className="skip-link no-print" href="#main-content">
        Əsas məzmuna keç
      </a>
      <header className="site-header workspace-sidebar no-print">
        <div className="header-inner">
          <Link className="brand" href="/profil" aria-label="SocialTwin AI ana səhifə">
            <span className="brand-mark">
              <PilotMark />
            </span>
            <span>
              SocialTwin<span className="brand-accent"> AI</span>
              <small>SMART OPPORTUNITIES.</small>
            </span>
          </Link>
          <p className="sidebar-label">MÜRACİƏTƏ DOĞRU</p>
          <nav className="header-navigation" aria-label="Əsas naviqasiya">
            <button
              aria-label="Profil"
              aria-current={step === 1 ? 'page' : undefined}
              disabled={Boolean(busy)}
              onClick={() => setStep(1)}
            >
              <UserRound size={20} />
              <span className="nav-copy">
                Profil<small>Təcrübəni tanı</small>
              </span>
              <span className="nav-state">
                {profile?.confirmed_at ? <Check size={15} /> : '01'}
              </span>
            </button>
            <button
              aria-label="İmkanlar"
              aria-current={step === 2 ? 'page' : undefined}
              disabled={Boolean(busy) || !profile?.confirmed_at}
              title={!profile?.confirmed_at ? 'Əvvəl profilini təsdiqlə' : undefined}
              onClick={() => setStep(2)}
            >
              <Search size={20} />
              <span className="nav-copy">
                İmkanlar<small>Özünə uyğun olanı tap</small>
              </span>
              <span className="nav-state">02</span>
            </button>
            <button
              aria-label="Sənədlər"
              aria-current={step === 3 ? 'page' : undefined}
              disabled={Boolean(busy) || !pack}
              title={!pack ? 'İmkanlar ekranında sənəd hazırla' : undefined}
              onClick={() => setStep(3)}
            >
              <Files size={20} />
              <span className="nav-copy">
                Sənədlər<small>Müraciətə hazırlaş</small>
              </span>
              <span className="nav-state">03</span>
            </button>
          </nav>
          <div className="sidebar-journey">
            <span className="journey-line" />
            <p>
              İlk addım səndən.
              <br />
              <strong>Növbəti addım birlikdə.</strong>
            </p>
            <div className="journey-stops" aria-hidden="true">
              <span className={step >= 1 ? 'reached' : ''} />
              <span className={step >= 2 ? 'reached' : ''} />
              <span className={step >= 3 ? 'reached' : ''} />
            </div>
          </div>
          <div className="header-right">
            <button
              className="icon-button intro-replay"
              onClick={() => {
                setShowWelcome(true);
                setStep(1);
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                });
              }}
              disabled={Boolean(busy)}
              aria-label="SocialTwin təqdimatını aç"
            >
              <PilotMark size={16} />
              <span>Təqdimat</span>
            </button>
            <p className="sidebar-session">
              <LockKeyhole size={16} />
              Yalnız bu sessiyada saxlanılır.
            </p>
            {mode === 'fixture' || !liveReady ? (
              <span className="mode-badge demo">
                {mode === 'fixture' ? 'Demo' : 'Bağlantı yoxdur'}
              </span>
            ) : null}
            <button
              className="icon-button"
              onClick={reset}
              disabled={Boolean(busy)}
              aria-label="Profili və sənədləri təmizlə"
              title="Sessiyanı təmizlə"
            >
              <RotateCcw size={16} />
              <span>Yenidən başla</span>
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" className="workspace-main">
        <div className="workspace-topbar no-print">
          <span>
            Şəxsi iş sahən <span className="topbar-divider">/</span>{' '}
            {['Profil', 'İmkanlar', 'Sənədlər'][step - 1]}
          </span>
          <span className="workspace-status">
            <span />
            {busy ? 'Hazırlanır' : 'Sənin nəzarətində'}
          </span>
        </div>
        {step === 1 && showWelcome && (
          <WelcomeIntro
            onStart={() => {
              setShowWelcome(false);
              requestAnimationFrame(() => {
                heading.current?.focus();
                heading.current?.scrollIntoView({
                  block: 'start',
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                });
              });
            }}
          />
        )}
        <div className={step === 1 && showWelcome ? 'intro-covered' : undefined}>
          <section className={`page-intro no-print ${step === 2 ? 'dashboard-hidden' : ''}`}>
            <div>
              <p className="eyebrow">{step === 1 ? '01 / PROFİL' : '03 / SƏNƏDLƏR'}</p>
              <h1 ref={heading} tabIndex={-1}>
                {step === 1
                  ? 'Profilini yarat'
                  : step === 2
                    ? 'İmkanları müqayisə et'
                    : 'Sənədlərini hazırla'}
              </h1>
              <p className="intro-copy">
                {step === 1
                  ? 'Təcrübəni paylaş, uyğun imkanları tap və müraciətini hazırla.'
                  : step === 2
                    ? 'Hər tələbin qarşısında real vəziyyətini gör. Nə hazırdır, nəyi dəqiqləşdirmək lazımdır?'
                    : 'Mətni redaktə et, yoxla və yüklə.'}
              </p>
            </div>
            <span className="page-context">
              <ShieldCheck size={16} />
              Təcrübən · Mənbən · Təsdiqin
            </span>
          </section>
          {mode === 'fixture' ? (
            <div className="notice no-print">
              <Layers size={18} />
              <p>
                <strong>Demo rejimi.</strong> Profil və elanlar nümunədir.
              </p>
            </div>
          ) : !liveReady ? (
            <div className="notice no-print">
              <CircleHelp size={18} />
              <p>Bağlantı qurulmayıb. Hələlik profili əl ilə doldura bilərsən.</p>
            </div>
          ) : null}
          {error ? (
            <p className="error no-print" role="alert">
              {error}
            </p>
          ) : null}
          {busy ? (
            <div className="busy no-print" role="status">
              <span className="processing-orbit">
                <span className="spinner" />
              </span>
              <div>
                <strong>{busy}</strong>
                <p>Səhifəni açıq saxla. Yazdıqların qorunur.</p>
                <span className="processing-track">
                  <span />
                </span>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div
              className={`profile-grid no-print ${profile && !showStoryEditor ? 'review-mode' : ''}`}
            >
              <section className="panel main-panel">
                <div className="section-heading">
                  <span className="mini-icon">
                    <FileText size={21} />
                  </span>
                  <div>
                    <h2>Səni daha yaxşı tanıyaq</h2>
                    <p>Bir neçə cümlə ilə başlaya bilərsən.</p>
                  </div>
                </div>
                <ProfileComposer
                  mode={inputMode}
                  fields={storyFields}
                  text={text}
                  disabled={Boolean(busy)}
                  onModeChange={(next) => {
                    if (next === inputMode) return;
                    if (next === 'free') setText(composeStory(storyFields));
                    else if (text !== composeStory(storyFields))
                      setStoryFields({ ...emptyStory, experience: text });
                    setInputMode(next);
                  }}
                  onFieldsChange={(fields) => {
                    setStoryFields(fields);
                    setProfile(null);
                    resetDerived();
                  }}
                  onTextChange={(value) => {
                    setText(value);
                    setProfile(null);
                    resetDerived();
                  }}
                />
                <div className="input-footer">
                  <span>Yalnız real təcrübəni paylaş.</span>
                  <span>{profileInput.length}/8000</span>
                </div>
                {mode === 'fixture' ? (
                  <div className="scenarios">
                    <span>Nümunə ilə yoxla</span>
                    <div>
                      {scenarios.map((scenario, i) => (
                        <button
                          key={scenario.id}
                          type="button"
                          className={text === scenario.text ? 'scenario selected' : 'scenario'}
                          disabled={Boolean(busy)}
                          onClick={() => {
                            setText(scenario.text);
                            setInputMode('free');
                            setProfile(null);
                            resetDerived();
                          }}
                        >
                          {i === 2 ? <BriefcaseBusiness size={15} /> : <GraduationCap size={15} />}
                          {scenario.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="form-bottom">
                  <div>
                    <label htmlFor="locale">Sənəd dili</label>
                    <select
                      id="locale"
                      value={locale}
                      disabled={Boolean(busy)}
                      onChange={(e) => {
                        const value = e.target.value as Locale;
                        setLocale(value);
                        if (profile) editProfile({ locale: value });
                      }}
                    >
                      <option value="az">Azərbaycan dili</option>
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <button
                    className="button primary"
                    onClick={extract}
                    disabled={Boolean(busy) || inputLength < 10 || profileInput.length > 8000}
                  >
                    {mode === 'fixture' ? 'Nümunə profilini aç' : 'Davam et'}
                    <ArrowRight size={17} />
                  </button>
                </div>
                {mode === 'fixture' && locale !== 'az' ? (
                  <p className="session-note">
                    Demo təcrübə maddələrini tərcümə etmir. Planın dili dəyişir; CV mətnini seçdiyin
                    dildə özün düzəldə bilərsən.
                  </p>
                ) : null}
                <button
                  className="text-button manual-link"
                  disabled={Boolean(busy)}
                  onClick={manualProfile}
                >
                  Əl ilə doldur <ArrowRight size={14} />
                </button>
              </section>
              <aside className="side-stack">
                <StoryPreview fields={storyFields} text={text} mode={inputMode} />
                <section className="composer-assurance">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Son söz həmişə səndədir.</strong>
                    <p>Profilini növbəti addımda yoxlayıb təsdiqləyəcəksən.</p>
                  </div>
                </section>
                <div className="portfolio-teaser">
                  <GitBranch size={18} />
                  <p>
                    GitHub layihələrini növbəti addımda əlavə edə bilərsən.
                    <span>İstəyə bağlıdır.</span>
                  </p>
                </div>
              </aside>
              {profile ? (
                <section className="panel profile-review" ref={review} tabIndex={-1}>
                  <div className="section-heading">
                    <span className="mini-icon">
                      <CheckCheck size={21} />
                    </span>
                    <div>
                      <h2>Profilini yoxla</h2>
                      <p>Məlumatları düzəlt və CV-də istifadə ediləcək maddələri seç.</p>
                    </div>
                    <button
                      className="button secondary edit-story-button"
                      disabled={Boolean(busy)}
                      onClick={() => {
                        setShowStoryEditor(!showStoryEditor);
                        if (!showStoryEditor)
                          requestAnimationFrame(() =>
                            window.document.querySelector('.main-panel')?.scrollIntoView({
                              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                                .matches
                                ? 'auto'
                                : 'smooth',
                              block: 'start',
                            }),
                          );
                      }}
                    >
                      <PencilLine size={16} />
                      {showStoryEditor ? 'Formanı yığ' : 'İlkin mətni dəyiş'}
                    </button>
                  </div>
                  <div className="review-summary">
                    <div>
                      <span>Təhsil</span>
                      <strong>{profile.education || 'Əlavə edilməyib'}</strong>
                    </div>
                    <div>
                      <span>Bacarıqlar</span>
                      <strong>{profile.skills.join(' · ') || 'Əlavə edilməyib'}</strong>
                    </div>
                    <div>
                      <span>Hədəf</span>
                      <strong>{profile.target_role || 'Əlavə edilməyib'}</strong>
                    </div>
                  </div>
                  <details className="profile-details">
                    <summary>
                      <PencilLine size={16} />
                      <span>Profil məlumatlarını düzəlt</span>
                      <Plus size={16} />
                    </summary>
                    <div className="review-fields">
                      <div>
                        <label htmlFor="name">
                          Ad, soyad <span>(istəyə bağlı)</span>
                        </label>
                        <input
                          id="name"
                          value={profile.name}
                          disabled={Boolean(busy)}
                          onChange={(e) => editProfile({ name: e.target.value })}
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label htmlFor="target">
                          Hədəf rol <span>(istəyə bağlı)</span>
                        </label>
                        <input
                          id="target"
                          value={profile.target_role ?? ''}
                          disabled={Boolean(busy)}
                          onChange={(e) =>
                            editProfile({
                              target_role: e.target.value.trim() ? e.target.value : null,
                            })
                          }
                          maxLength={1000}
                        />
                      </div>
                      <div>
                        <label htmlFor="education">Təhsil</label>
                        <input
                          id="education"
                          value={profile.education}
                          disabled={Boolean(busy)}
                          onChange={(e) => editProfile({ education: e.target.value })}
                          maxLength={1000}
                        />
                      </div>
                      <div>
                        <label htmlFor="interests">
                          Maraq sahələrin <span>(vergüllə ayır)</span>
                        </label>
                        <input
                          id="interests"
                          placeholder="Süni intellekt, biznes, sosial təsir…"
                          maxLength={1200}
                          value={interestsText}
                          disabled={Boolean(busy)}
                          onChange={(event) => {
                            setInterestsText(event.target.value);
                            editProfile({
                              interests: event.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="languages">
                          Dil biliklərin <span>(bildiyin səviyyə ilə)</span>
                        </label>
                        <input
                          id="languages"
                          placeholder="İngilis B2, Azərbaycan ana dili…"
                          maxLength={900}
                          value={languagesText}
                          disabled={Boolean(busy)}
                          onChange={(event) => {
                            setLanguagesText(event.target.value);
                            editProfile({
                              languages: event.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="location">Yer və iş formatı seçimin</label>
                        <input
                          id="location"
                          placeholder="Bakı, remote və ya xaricdə…"
                          maxLength={120}
                          value={profile.location ?? ''}
                          disabled={Boolean(busy)}
                          onChange={(event) => editProfile({ location: event.target.value })}
                        />
                      </div>
                      <div className="eligibility-input">
                        <label htmlFor="eligibility-notes">
                          Əlavə uyğunluq məlumatı <span>(istəyə bağlı)</span>
                        </label>
                        <textarea
                          id="eligibility-notes"
                          rows={3}
                          maxLength={1600}
                          placeholder="Tələbə statusu, təhsil müddəti, iş təcrübəsi və ya şirkət qeydiyyatı…"
                          value={profile.eligibility_notes ?? ''}
                          disabled={Boolean(busy)}
                          onChange={(event) =>
                            editProfile({ eligibility_notes: event.target.value })
                          }
                        />
                        <small>
                          Elan şərtlərini yoxlamaq üçündür. Şəxsiyyət sənədi lazım deyil.
                        </small>
                      </div>
                      <div>
                        <label htmlFor="skills">
                          Bacarıqlar <span>(vergüllə ayır)</span>
                        </label>
                        <input
                          id="skills"
                          value={skillsText}
                          disabled={Boolean(busy)}
                          onChange={(e) => {
                            setSkillsText(e.target.value);
                            editProfile({
                              skills: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            });
                          }}
                        />
                      </div>
                    </div>
                    <fieldset className="profile-opportunity-types">
                      <legend>Hansı fürsətləri göstərək?</legend>
                      {(Object.keys(categoryLabels) as (keyof typeof categoryLabels)[]).map(
                        (key) => (
                          <label key={key}>
                            <input
                              type="checkbox"
                              disabled={Boolean(busy)}
                              checked={
                                !profile.opportunity_types?.length ||
                                profile.opportunity_types.includes(key)
                              }
                              onChange={(event) => {
                                const current = profile.opportunity_types?.length
                                  ? profile.opportunity_types
                                  : (Object.keys(
                                      categoryLabels,
                                    ) as (keyof typeof categoryLabels)[]);
                                const next = event.target.checked
                                  ? [...current, key]
                                  : current.filter((type) => type !== key);
                                if (next.length) editProfile({ opportunity_types: next });
                              }}
                            />
                            {categoryLabels[key]}
                          </label>
                        ),
                      )}
                    </fieldset>
                  </details>
                  <div className="claims-heading">
                    <h3 className="claims-title">CV-də istifadə ediləcək təcrübələr</h3>
                    <button
                      className="button secondary select-all-claims"
                      disabled={Boolean(busy) || !profile.claims.length}
                      onClick={() =>
                        editProfile({
                          claims: profile.claims.map((claim) => ({
                            ...claim,
                            user_approved: !profile.claims.every((c) => c.user_approved),
                          })),
                        })
                      }
                    >
                      <CheckCheck size={16} />
                      {profile.claims.length > 0 && profile.claims.every((c) => c.user_approved)
                        ? 'Seçimi təmizlə'
                        : 'Hamısını seç'}
                    </button>
                  </div>
                  <div className="claim-list">
                    {profile.claims.map((claim) => (
                      <div className="claim" key={claim.id}>
                        <input
                          type="checkbox"
                          aria-label={`${claim.text} maddəsini təsdiqlə`}
                          checked={claim.user_approved}
                          disabled={Boolean(busy)}
                          onChange={(e) =>
                            editProfile({
                              claims: profile.claims.map((c) =>
                                c.id === claim.id ? { ...c, user_approved: e.target.checked } : c,
                              ),
                            })
                          }
                        />
                        <textarea
                          aria-label="Təcrübə mətnini düzəlt"
                          rows={2}
                          value={claim.text}
                          maxLength={1000}
                          disabled={Boolean(busy)}
                          onChange={(e) =>
                            editProfile({
                              claims: profile.claims.map((c) =>
                                c.id === claim.id
                                  ? { ...c, text: e.target.value, user_approved: false }
                                  : c,
                              ),
                            })
                          }
                        />
                        <span className="subtle-tag">
                          {claim.sources?.length ? 'GitHub + təsdiq' : 'Bəyan'}
                        </span>
                        <button
                          className="icon-button"
                          aria-label="Təcrübə maddəsini sil"
                          title="Maddəni sil"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            editProfile({ claims: profile.claims.filter((c) => c.id !== claim.id) })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="add-claim">
                    <input
                      aria-label="Yeni təcrübə maddəsi"
                      placeholder="Öz təcrübəni əlavə et…"
                      value={manualClaim}
                      maxLength={1000}
                      disabled={Boolean(busy)}
                      onChange={(e) => setManualClaim(e.target.value)}
                    />
                    <button
                      className="button secondary"
                      aria-label="Təcrübə maddəsi əlavə et"
                      disabled={Boolean(busy) || !manualClaim.trim() || profile.claims.length >= 20}
                      onClick={() => {
                        editProfile({
                          claims: [
                            ...profile.claims,
                            {
                              id: crypto.randomUUID(),
                              text: manualClaim.trim(),
                              user_approved: false,
                            },
                          ],
                        });
                        setManualClaim('');
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <details className="contact-fields">
                    <summary>Əlaqə məlumatları · istəyə bağlı</summary>
                    <p className="feature-note">
                      CV başlığında göstərilir. AI təcrübə faktı kimi istifadə etmir.
                    </p>
                    {(['email', 'phone', 'website'] as const).map((key) => (
                      <label key={key}>
                        {key === 'email'
                          ? 'E-poçt'
                          : key === 'phone'
                            ? 'Telefon'
                            : 'Portfolio / vebsayt'}
                        <input
                          value={profile.contact?.[key] ?? ''}
                          disabled={Boolean(busy)}
                          maxLength={key === 'email' ? 150 : key === 'phone' ? 80 : 250}
                          onChange={(e) =>
                            editProfile({
                              contact: {
                                email: '',
                                phone: '',
                                website: '',
                                ...profile.contact,
                                [key]: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </details>
                  <details className="portfolio-disclosure">
                    <summary>
                      <GitBranch size={18} />
                      <span>
                        GitHub layihələrini əlavə et<small>İstəyə bağlı · public layihələr</small>
                      </span>
                      <Plus size={16} />
                    </summary>
                    <GitHubPanel
                      key={profile.id}
                      locale={profile.locale}
                      disabled={Boolean(busy)}
                      onAdd={addGitHubClaim}
                    />
                  </details>
                  {profile.missing_information.length ? (
                    <div className="missing">
                      <CircleHelp size={18} />
                      <div>
                        <strong>Dəqiqləşdirməyə dəyər</strong>
                        <ul>
                          {profile.missing_information.map((info) => (
                            <li key={info}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                  <div className="review-footer">
                    <p>
                      <CheckCheck size={17} />
                      <strong>
                        {profile.claims.filter((c) => c.user_approved).length}/
                        {profile.claims.length}
                      </strong>{' '}
                      maddə təsdiqlənib
                    </p>
                    <button
                      className="button primary"
                      onClick={confirm}
                      disabled={Boolean(busy) || !profile.claims.some((c) => c.user_approved)}
                    >
                      Profilimi təsdiqlə
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {step === 2 && profile ? (
            <>
              {matchWarnings.map((warning, i) => (
                <p className="source-policy no-print" role="status" key={i}>
                  {warning}
                </p>
              ))}
              <OpportunityDashboard
                profile={profile}
                matches={matches}
                excludedMatches={excludedMatches}
                saved={savedIds}
                onSavedChange={setSavedIds}
                catalogCount={catalogCount}
                status={matchStatus}
                fixture={mode === 'fixture'}
                busy={Boolean(busy)}
                onEdit={() => setStep(1)}
                onRetry={() => {
                  void confirm();
                }}
                onGenerate={(id) => {
                  void generate(id);
                }}
              />
              <AiCoach
                key={`${profile.id}-${profile.revision}`}
                profile={profile}
                opportunities={matches.map((m) => m.opportunity)}
                disabled={Boolean(busy)}
                live={mode === 'live' && liveReady}
              />
            </>
          ) : null}

          {step === 3 && pack ? (
            <div className="package-grid">
              <section className="panel document-panel">
                <div className="document-toolbar no-print">
                  <div>
                    <h2>Müraciət studiyası</h2>
                    <p>{pack.opportunity_name ?? profile?.target_role}</p>
                  </div>
                  <span className="subtle-tag">
                    {pack.mode === 'fixture' ? 'Demo qaralama' : 'Qaralama'}
                  </span>
                </div>
                <div className="document-tabs no-print" role="tablist" aria-label="Sənəd növü">
                  {(['resume', 'cv', 'letter', 'plan'] as const)
                    .filter((key) => key !== 'letter' || pack.draft.letter.length > 0)
                    .map((key) => (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        aria-controls="document-panel"
                        tabIndex={tab === key ? 0 : -1}
                        id={`tab-${key}`}
                        onClick={() => switchTab(key)}
                        onKeyDown={(e) => {
                          const keys = (['resume', 'cv', 'letter', 'plan'] as const).filter(
                            (k) => k !== 'letter' || pack.draft.letter.length > 0,
                          );
                          const index = keys.indexOf(key);
                          const next =
                            e.key === 'ArrowRight'
                              ? keys[(index + 1) % keys.length]
                              : e.key === 'ArrowLeft'
                                ? keys[(index - 1 + keys.length) % keys.length]
                                : e.key === 'Home'
                                  ? keys[0]
                                  : e.key === 'End'
                                    ? keys[keys.length - 1]
                                    : null;
                          if (next) {
                            e.preventDefault();
                            switchTab(next);
                            window.document.getElementById('tab-' + next)?.focus();
                          }
                        }}
                      >
                        {key === 'letter'
                          ? 'Məktub'
                          : key === 'cv'
                            ? 'CV'
                            : key === 'plan'
                              ? 'Plan'
                              : 'Resume'}
                      </button>
                    ))}
                </div>
                <div role="tabpanel" id="document-panel" aria-labelledby={`tab-${tab}`}>
                  {pack.writing_policy === 'disclose_ai' && (
                    <p className="source-policy no-print">
                      Bu fond ərizəni öz sözlərinlə yazmağı və AI yardımını açıqlamağı tələb edir.
                      Buradakı CV hazırlıq üçündür; qrant ərizəsi yaradılmır. Rəsmi qaydalara görə
                      dialoq qeydlərini də təqdim et.
                    </p>
                  )}
                  <div className="paper-controls no-print">
                    <div className="paper-template-switch" aria-label="Sənəd dizaynı">
                      <button
                        aria-pressed={paperTemplate === 'modern'}
                        disabled={Boolean(busy)}
                        onClick={() => setPaperTemplate('modern')}
                      >
                        Modern
                      </button>
                      <button
                        aria-pressed={paperTemplate === 'classic'}
                        disabled={Boolean(busy)}
                        onClick={() => setPaperTemplate('classic')}
                      >
                        Klassik
                      </button>
                    </div>
                    <button
                      className="button secondary"
                      aria-expanded={showDocumentEditor}
                      aria-controls="document-edit-area"
                      onClick={() => setShowDocumentEditor((value) => !value)}
                    >
                      <PencilLine size={16} />
                      {showDocumentEditor ? 'Görünüşə qayıt' : 'Mətni redaktə et'}
                    </button>
                  </div>
                  <div
                    id="document-edit-area"
                    className="document-edit-area no-print"
                    hidden={!showDocumentEditor}
                  >
                    <label className="document-label" htmlFor="document-editor">
                      Sənəd mətni
                    </label>
                    <textarea
                      className="document-editor no-print"
                      id="document-editor"
                      value={document}
                      onChange={(e) => {
                        setDocument(e.target.value);
                        setApprovedDocument(false);
                      }}
                      maxLength={20000}
                      disabled={Boolean(busy)}
                    />
                  </div>
                  {profile && (
                    <div className="document-preview-stage no-print">
                      <div className="paper-stage-label">
                        <span>
                          A4 ·{' '}
                          {tab === 'plan'
                            ? 'Hazırlıq planı'
                            : tab === 'letter'
                              ? 'Motivasiya məktubu'
                              : tab === 'cv'
                                ? 'CV'
                                : 'Resume'}
                        </span>
                        <span>{paperTemplate === 'modern' ? 'Modern' : 'Klassik'} dizayn</span>
                      </div>
                      <DocumentPreview
                        text={document}
                        locale={profile.locale}
                        kind={tab}
                        name={profile.name}
                        template={paperTemplate}
                      />
                    </div>
                  )}
                </div>
                <details className="claim-sources no-print">
                  <summary>Təsdiqlənmiş mənbələr</summary>
                  <ul>
                    {profile?.claims
                      .filter((c) => c.user_approved)
                      .map((c) => (
                        <li key={c.id}>
                          {c.text}
                          <small>
                            {c.sources?.length
                              ? 'İstifadəçi tərəfindən təsdiqlənmiş GitHub töhfəsi'
                              : 'İstifadəçi bəyanı'}
                          </small>
                          {c.sources?.map((source) => (
                            <a
                              key={source.id}
                              href={source.source_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {source.repository} · {source.path}{' '}
                            </a>
                          ))}
                        </li>
                      ))}
                  </ul>
                </details>
                <div className="provenance no-print">
                  <ShieldCheck size={16} />
                  <p>Sənəd təsdiqlədiyin profilə əsaslanır.</p>
                </div>
                <label className="document-approval no-print">
                  <input
                    type="checkbox"
                    checked={approvedDocument}
                    onChange={(e) => setApprovedDocument(e.target.checked)}
                  />
                  Mətni yoxladım və məlumatların doğruluğunu təsdiqləyirəm.
                </label>
                <div className="export-actions no-print">
                  <button
                    className="button primary"
                    disabled={Boolean(busy) || !approvedDocument || !document.trim()}
                    onClick={() => void downloadPdf()}
                  >
                    <Download size={17} />
                    PDF yüklə
                  </button>
                  <button
                    className="button secondary"
                    disabled={Boolean(busy) || !approvedDocument || !document.trim()}
                    onClick={() => window.print()}
                  >
                    <Printer size={17} />
                    PDF üçün çap et
                  </button>
                  <button
                    className="text-button"
                    disabled={Boolean(busy) || !approvedDocument || !document.trim()}
                    onClick={download}
                  >
                    TXT
                  </button>
                </div>
                <div className="print-document">
                  <p>
                    {pack.mode === 'fixture' ? 'DEMO / NÜMUNƏ' : ''}
                    {!approvedDocument ? ' · QARALAMA' : ''}
                  </p>
                  {profile && (
                    <DocumentPreview
                      text={document}
                      locale={profile.locale}
                      kind={tab}
                      name={profile.name}
                      template={paperTemplate}
                    />
                  )}
                </div>
              </section>
              <aside className="side-stack no-print">
                {profile && (
                  <AiCoach
                    key={`${profile.id}-${profile.revision}-${pack.opportunity_id}-${tab}`}
                    profile={profile}
                    opportunityId={pack.opportunity_id}
                    document={document}
                    disabled={Boolean(busy)}
                    live={mode === 'live' && liveReady}
                  />
                )}
                <section className={`panel plan-panel ${tab === 'plan' ? 'dashboard-hidden' : ''}`}>
                  <h2>Hazırlıq planı</h2>
                  <ol>
                    {pack.draft.action_plan.map((action, i) => (
                      <li key={`${i}-${action.title}`}>
                        <span>{i + 1}</span>
                        <div>
                          <h3>{action.title}</h3>
                          <p>{action.deliverable}</p>
                          <small>~{action.estimated_minutes} dəqiqə</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="source-note">
                    {pack.opportunity_id
                      ? selectedDeadline?.date
                        ? `Son tarix: ${displayDateAz(selectedDeadline.date)}. ${selectedDeadline.source_text ?? ''}`
                        : selectedDeadline?.kind === 'rolling'
                          ? 'Davamlı qəbul — sabit son tarix yoxdur. Baxılma şərtlərini rəsmi mənbədə yoxla.'
                          : 'Bu nümunənin real son tarixi yoxdur.'
                      : 'Addımları öz vaxtına uyğun tamamla.'}
                  </p>
                </section>
                <section className="panel tips-panel">
                  <h3>CV üçün 3 təklif</h3>
                  <ul>
                    {pack.draft.cv_suggestions.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </section>
                <button className="text-button" disabled={Boolean(busy)} onClick={() => setStep(2)}>
                  <ArrowLeft size={16} />
                  İmkanlara qayıt
                </button>
              </aside>
            </div>
          ) : null}
          <footer className="site-footer no-print">
            <span>
              <PilotMark size={20} />
              SocialTwin AI
            </span>
            <p>Smart Life, Smart Opportunities.</p>
          </footer>
        </div>
      </main>
    </>
  );
}
