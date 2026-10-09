'use client';
import { useId, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileCheck2,
  LoaderCircle,
  Map,
  MessageSquare,
  Send,
  Target,
} from 'lucide-react';
import type { Profile, Opportunity } from '@/lib/schemas';
import type { CoachResult } from '@/lib/coach-contracts';

type Props = {
  profile: Profile;
  opportunities?: Opportunity[];
  opportunityId?: string | null;
  document?: string;
  disabled?: boolean;
  live?: boolean;
};
type Mode = 'review' | 'interview' | 'roadmap';
const modes = [
  {
    id: 'interview' as const,
    label: 'Müsahibə məşqi',
    hint: 'Suala cavab ver, rəy al',
    icon: MessageSquare,
  },
  {
    id: 'review' as const,
    label: 'Sənəd məsləhəti',
    hint: 'Sənədini daha aydın et',
    icon: FileCheck2,
  },
  { id: 'roadmap' as const, label: 'İnkişaf planı', hint: 'Növbəti addımını seç', icon: Map },
];
function CoachNotes({ result }: { result: CoachResult }) {
  return (
    <div className="coach-notes">
      <p className="coach-summary">{result.summary}</p>
      {result.improvements.length > 0 && (
        <div className="coach-note-group">
          <h3>Nəyi yaxşılaşdıraq?</h3>
          {result.improvements.map((item, i) => (
            <article className="coach-advice" key={i}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{item.issue}</strong>
                <p>{item.action}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      {result.missing_information.length > 0 && (
        <details className="coach-missing">
          <summary>Dəqiqləşdiriləcək {result.missing_information.length} məqam</summary>
          <ul>
            {result.missing_information.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </details>
      )}
      {result.priorities.length > 0 && (
        <div className="coach-note-group">
          <h3>Növbəti addımlar</h3>
          {result.priorities.map((item, i) => (
            <article className="coach-advice" key={i}>
              <span>
                <Check size={15} />
              </span>
              <div>
                <strong>{item.next_step}</strong>
                <p>{item.deliverable}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
export function AiCoach({
  profile,
  opportunities = [],
  opportunityId = null,
  document = '',
  disabled = false,
  live = true,
}: Props) {
  const id = useId();
  const answerInput = useRef<HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState(opportunityId ?? '');
  const [mode, setMode] = useState<Mode>(document ? 'review' : 'interview');
  const [result, setResult] = useState<CoachResult | null>(null);
  const [reviewedText, setReviewedText] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, CoachResult>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const question = mode === 'interview' ? result?.questions[activeQuestion] : undefined;
  const answer = answers[activeQuestion] ?? '';
  const stale = mode === 'review' && Boolean(result) && document !== reviewedText;
  function clear() {
    setResult(null);
    setAnswers({});
    setFeedback({});
    setActiveQuestion(0);
    setError('');
  }
  async function run(practice = false) {
    if (busy || disabled || !live || (practice && (!question || !answer.trim()))) return;
    setBusy(true);
    setError('');
    const currentText = document;
    const currentQuestion = activeQuestion;
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          profile,
          opportunity_id: selected || null,
          mode,
          ...(mode === 'review' ? { document: currentText.slice(0, 8000) } : {}),
          ...(practice ? { question: question?.question, answer } : {}),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok)
        throw new Error(body.error?.message ?? 'Məsləhət hazırlanmadı. Yenidən yoxla.');
      if (body.data.profile_revision !== profile.revision)
        throw new Error('Profil dəyişib. Yenidən yoxla.');
      if (practice) setFeedback((values) => ({ ...values, [currentQuestion]: body.data.result }));
      else {
        setResult(body.data.result);
        setReviewedText(currentText);
        setActiveQuestion(0);
        setAnswers({});
        setFeedback({});
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Bağlantı alınmadı.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="feature-panel ai-coach no-print" aria-labelledby={`${id}-title`}>
      <div className="coach-heading">
        <span className="coach-avatar">
          <MessageSquare size={23} />
        </span>
        <div>
          <span className="coach-eyebrow">BİRLİKDƏ HAZIRLAŞAQ</span>
          <h2 id={`${id}-title`}>Karyera məsləhətçin</h2>
        </div>
      </div>
      <p className="coach-intro">Məqsədini seç. Bir addımdan başlayaq.</p>
      <div className="coach-modes" aria-label="Məsləhət növü">
        {modes
          .filter((item) => item.id !== 'review' || document)
          .map(({ id: key, label, hint, icon: Icon }) => (
            <button
              key={key}
              aria-pressed={mode === key}
              disabled={busy || disabled}
              onClick={() => {
                setMode(key);
                clear();
              }}
            >
              <Icon size={19} />
              <span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              {mode === key && <Check size={14} />}
            </button>
          ))}
      </div>
      {opportunities.length > 0 && (
        <label className="coach-target" htmlFor={`${id}-target`}>
          <span>
            <Target size={15} /> Nəyə hazırlaşırsan?
          </span>
          <select
            id={`${id}-target`}
            value={selected}
            disabled={busy || disabled}
            onChange={(e) => {
              setSelected(e.target.value);
              clear();
            }}
          >
            <option value="">Ümumi karyera hazırlığı</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {!live && <p className="feature-note">Məsləhət almaq üçün canlı AI bağlantısı lazımdır.</p>}
      {stale && (
        <p className="coach-stale" role="status">
          Sənəd dəyişib. Yeni mətnə uyğun rəy almaq üçün yenidən yoxla.
        </p>
      )}
      <button
        className="button primary coach-start"
        disabled={busy || disabled || !live}
        onClick={() => void run()}
      >
        {busy ? (
          <>
            <LoaderCircle size={17} className="spinning" /> Hazırlanır…
          </>
        ) : (
          <>
            {mode === 'interview'
              ? result
                ? 'Yeni suallar hazırla'
                : 'Məşqə başla'
              : mode === 'review'
                ? 'Sənədimi yoxla'
                : 'Planımı hazırla'}
            <ArrowRight size={16} />
          </>
        )}
      </button>
      {busy && (
        <p className="coach-loading" role="status">
          {question && answer
            ? 'Cavabına rəy hazırlanır…'
            : 'Təsdiqlədiyin təcrübələr nəzərdən keçirilir…'}
        </p>
      )}
      {error && (
        <p className="feature-error" role="alert">
          {error}
        </p>
      )}
      {result && !stale && (
        <div className="coach-result" aria-live="polite">
          {question && (
            <div className="coach-practice">
              <div className="question-navigation">
                <span>
                  Sual {activeQuestion + 1} / {result.questions.length}
                </span>
                <div>
                  <button
                    className="icon-button"
                    aria-label="Əvvəlki sual"
                    disabled={busy || activeQuestion === 0}
                    onClick={() => setActiveQuestion((n) => n - 1)}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Növbəti sual"
                    disabled={busy || activeQuestion === result.questions.length - 1}
                    onClick={() => setActiveQuestion((n) => n + 1)}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <h3>{question.question}</h3>
              <p>{question.why}</p>
              <details className="answer-hint">
                <summary>Cavaba necə başlayım?</summary>
                <p>{question.answer_outline}</p>
                {question.claim_ids.length > 0 && (
                  <div className="coach-evidence">
                    <strong>Təsdiqlədiyin təcrübə</strong>
                    {question.claim_ids.map((claimId) => (
                      <p key={claimId}>{profile.claims.find((c) => c.id === claimId)?.text}</p>
                    ))}
                  </div>
                )}
              </details>
              <label htmlFor={`${id}-answer`}>Sənin cavabın</label>
              <textarea
                ref={answerInput}
                id={`${id}-answer`}
                placeholder="Nə etdin, necə etdin və nə öyrəndin? Öz sözlərinlə yaz."
                rows={5}
                maxLength={3000}
                value={answer}
                disabled={busy || disabled}
                onChange={(e) => {
                  setAnswers((values) => ({ ...values, [activeQuestion]: e.target.value }));
                  setFeedback((values) => {
                    const next = { ...values };
                    delete next[activeQuestion];
                    return next;
                  });
                }}
              />
              <div className="coach-answer-actions">
                <span>{answer.length}/3000</span>
                <button
                  className="button primary"
                  disabled={busy || disabled || !live || !answer.trim()}
                  onClick={() => void run(true)}
                >
                  <Send size={15} /> Cavabıma rəy ver
                </button>
              </div>
              <small className="feature-note">Cavabın profilə avtomatik əlavə edilmir.</small>
              {feedback[activeQuestion] && (
                <div className="coach-feedback">
                  <span className="coach-eyebrow">CAVABINA RƏY</span>
                  <CoachNotes result={feedback[activeQuestion]} />
                </div>
              )}
            </div>
          )}
          {!question && <CoachNotes result={result} />}
        </div>
      )}
      {!result && !busy && (
        <div className="coach-empty">
          <span>01</span>
          <p>
            {mode === 'interview'
              ? 'Əvvəl sualları hazırlayaq. Sonra hər suala cavab yazıb ayrıca rəy ala bilərsən.'
              : mode === 'review'
                ? 'Hazırkı sənədində aydınlığı, quruluşu və çatışmayan məlumatları yoxlayaq.'
                : 'Təcrübə və hədəfinə əsaslanan konkret addımlar hazırlayaq.'}
          </p>
        </div>
      )}
    </section>
  );
}
