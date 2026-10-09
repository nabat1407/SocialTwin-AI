import { GraduationCap, BriefcaseBusiness, Target, AlignLeft, ListChecks } from 'lucide-react';

export type StoryFields = { education: string; experience: string; goal: string };
export const emptyStory: StoryFields = { education: '', experience: '', goal: '' };

export function composeStory(fields: StoryFields) {
  return [
    fields.education.trim() ? `Təhsil və bacarıqlar:\n${fields.education}` : '',
    fields.experience.trim() ? `Təcrübə və layihələr:\n${fields.experience}` : '',
    fields.goal.trim() ? `Axtardığım imkan:\n${fields.goal}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

const questions = [
  {
    key: 'education',
    title: 'Nə bilirsən?',
    label: 'Təhsil və bacarıqlar',
    hint: 'İxtisas, bildiyin alətlər və dillər',
    placeholder: 'Məsələn: iqtisadiyyat tələbəsiyəm, Excel bilirəm…',
    Icon: GraduationCap,
  },
  {
    key: 'experience',
    title: 'Nə etmisən?',
    label: 'Təcrübə və layihələr',
    hint: 'İş, kurs layihəsi, könüllülük və ya şəxsi layihə',
    placeholder: 'Gördüyün işi və öz töhfəni qısa yaz…',
    Icon: BriefcaseBusiness,
  },
  {
    key: 'goal',
    title: 'Nə axtarırsan?',
    label: 'Axtardığın imkan',
    hint: 'İş, təqaüd, qrant və ya təcrübə proqramı',
    placeholder: 'Məsələn: xaricdə magistr təqaüdü axtarıram…',
    Icon: Target,
  },
] as const;

type Props = {
  mode: 'guided' | 'free';
  fields: StoryFields;
  text: string;
  disabled: boolean;
  onModeChange: (mode: 'guided' | 'free') => void;
  onFieldsChange: (fields: StoryFields) => void;
  onTextChange: (value: string) => void;
};

export function ProfileComposer({
  mode,
  fields,
  text,
  disabled,
  onModeChange,
  onFieldsChange,
  onTextChange,
}: Props) {
  return (
    <>
      <div className="composer-modes" aria-label="Profil doldurma üsulu">
        <button
          type="button"
          aria-pressed={mode === 'guided'}
          disabled={disabled}
          onClick={() => onModeChange('guided')}
        >
          <ListChecks size={16} /> Suallarla doldur
        </button>
        <button
          type="button"
          aria-pressed={mode === 'free'}
          disabled={disabled}
          onClick={() => onModeChange('free')}
        >
          <AlignLeft size={16} /> Sərbəst yaz
        </button>
      </div>
      {mode === 'guided' ? (
        <div className="composer-questions">
          {questions.map(({ key, title, label, hint, placeholder, Icon }, index) => (
            <div className={`composer-question ${fields[key].trim() ? 'filled' : ''}`} key={key}>
              <div className="question-heading">
                <span className="question-icon">
                  <Icon size={18} />
                </span>
                <label htmlFor={`story-${key}`}>
                  <strong>{title}</strong>
                  <span>{hint}</span>
                </label>
                <span className="question-number">0{index + 1}</span>
              </div>
              <textarea
                id={`story-${key}`}
                aria-label={label}
                rows={2}
                maxLength={2400}
                value={fields[key]}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(event) => onFieldsChange({ ...fields, [key]: event.target.value })}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="composer-free">
          <label htmlFor="profile-text">Təcrübə və hədəflərin</label>
          <textarea
            id="profile-text"
            className="profile-text"
            rows={8}
            value={text}
            maxLength={8000}
            disabled={disabled}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Təhsilini, gördüyün işləri və axtardığın imkanı yaz. Hazır mətnini də bura əlavə edə bilərsən."
          />
        </div>
      )}
    </>
  );
}

export function StoryPreview({ fields, text, mode }: Pick<Props, 'fields' | 'text' | 'mode'>) {
  const completed = Object.values(fields).filter((value) => value.trim()).length;
  return (
    <section className="story-preview">
      <div className="preview-heading">
        <span>PROFİL QARALAMAN</span>
        <span className="preview-dot" />
        Canlı
      </div>
      <h2>Hər təcrübə bir başlanğıcdır.</h2>
      <p>Yazdıqların burada toplanır.</p>
      {mode === 'guided' ? (
        <div className="preview-topics">
          {questions.map(({ key, label, Icon }) => (
            <div className={fields[key].trim() ? 'complete' : ''} key={key}>
              <Icon size={17} />
              <div>
                <strong>{label}</strong>
                <p>{fields[key].trim() || 'Hələ əlavə edilməyib'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="preview-narrative">
          <AlignLeft size={18} />
          <p>{text.trim() || 'Təcrübən haqqında yazmağa başla.'}</p>
        </div>
      )}
      <div className="preview-footer">
        {mode === 'guided' ? `${completed}/3 mövzu əlavə edilib` : `${text.length} simvol`}
        <span>Hələ təsdiqlənməyib</span>
      </div>
    </section>
  );
}
