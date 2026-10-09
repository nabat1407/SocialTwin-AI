import { draftSchema, type Draft, type Locale, type Profile } from './schemas';

const copy: Record<
  Locale,
  { letter: string; steps: string[]; deliverables: string[]; tips: string[] }
> = {
  az: {
    letter: 'Müraciətim üçün təsdiqlədiyim təcrübəni təqdim edirəm:',
    steps: [
      'Məlumatları tamamla',
      'Ən uyğun təcrübəni seç',
      'CV və məktubu yoxla',
      'Rəsmi tələbləri son dəfə yoxla',
    ],
    deliverables: [
      'Təhsil və təcrübə tarixlərini dəqiqləşdir.',
      'İki konkret layihə və ya iş nümunəsini öz töhfənlə təsvir et.',
      'Yalnız doğru və təsdiqlədiyin iddiaları saxla.',
      'Sənədləri və rəsmi mənbədəki son tarixi yoxla.',
    ],
    tips: [
      'Təcrübə tarixlərini və rolunu dəqiq göstər.',
      'Layihədə öz töhfəni konkret cümlə ilə yaz; nəticə ölçülməyibsə rəqəm əlavə etmə.',
      'Hədəf rol üçün ən uyğun bacarıqları yuxarıda göstər.',
    ],
  },
  tr: {
    letter: 'Başvurum için onayladığım deneyimleri sunuyorum:',
    steps: [
      'Bilgileri tamamla',
      'İlgili deneyimi seç',
      'CV ve mektubu kontrol et',
      'Resmî gereksinimleri kontrol et',
    ],
    deliverables: [
      'Eğitim ve deneyim tarihlerini netleştir.',
      'İki somut proje veya iş örneğinde kendi katkını anlat.',
      'Yalnız doğru ve onayladığın iddiaları koru.',
      'Belgeleri ve resmî kaynaktaki son tarihi kontrol et.',
    ],
    tips: [
      'Deneyim tarihlerini ve rolünü açık yaz.',
      'Projede kendi katkını belirt; ölçülmeyen sonuçlara sayı ekleme.',
      'Hedef rolle ilgili becerileri önce göster.',
    ],
  },
  en: {
    letter: 'I am sharing the following confirmed experience for my application:',
    steps: [
      'Complete missing details',
      'Select relevant experience',
      'Review your CV and letter',
      'Check official requirements',
    ],
    deliverables: [
      'Confirm education and experience dates.',
      'Describe your own contribution in two concrete examples.',
      'Keep only accurate, approved claims.',
      'Check documents and the deadline at the official source.',
    ],
    tips: [
      'Add clear dates and your role.',
      'Describe your own project contribution without inventing metrics.',
      'Put skills relevant to the target role first.',
    ],
  },
};

export function fixtureDraft(profile: Profile, withLetter: boolean): Draft {
  const c = copy[profile.locale];
  const claims = profile.claims.filter((claim) => claim.user_approved);
  const entries = claims
    .slice(0, 15)
    .map((claim) => ({ text: claim.text, section: 'experience' as const, claim_ids: [claim.id] }));
  const finalReview = {
    az: ['Son yoxlamanı tamamla', 'Hədəf rol, sənəd dili və əlaqə məlumatlarını yoxla.'],
    tr: ['Son kontrolü tamamla', 'Hedef rolü, belge dilini ve iletişim bilgilerini kontrol et.'],
    en: [
      'Complete the final review',
      'Check your target role, document language and contact details.',
    ],
  }[profile.locale];
  const cvReview = {
    az: 'CV və resume-ni yoxla',
    tr: 'CV ve resume kontrolü',
    en: 'Review your CV and resume',
  }[profile.locale];
  return draftSchema.parse({
    resume: entries.slice(0, 3),
    cv: entries,
    letter: withLetter
      ? [
          {
            text: `${c.letter}\n\n${claims.map((claim) => claim.text).join(' ')}`,
            claim_ids: claims.slice(0, 12).map((claim) => claim.id),
          },
        ]
      : [],
    action_plan: c.steps.map((title, i) => ({
      title: !withLetter && i === 3 ? finalReview[0] : !withLetter && i === 2 ? cvReview : title,
      deliverable: !withLetter && i === 3 ? finalReview[1] : c.deliverables[i],
      estimated_minutes: [20, 40, 30, 15][i],
    })),
    cv_suggestions: c.tips,
  });
}

export function validateClaimReferences(draft: Draft, profile: Profile, withLetter: boolean) {
  const allowed = new Set(profile.claims.filter((c) => c.user_approved).map((c) => c.id));
  if (
    !allowed.size ||
    [...draft.resume, ...draft.cv].some(
      (entry) => !entry.claim_ids.length || entry.claim_ids.some((id) => !allowed.has(id)),
    ) ||
    draft.letter.some((entry) => entry.claim_ids.some((id) => !allowed.has(id))) ||
    (!withLetter && draft.letter.length) ||
    (withLetter && !draft.letter.length)
  )
    throw new Error('Invalid claim references');
  // Numeric qualifications/metrics must exist in the exact cited claims.
  // Formatting separators are ignored; this never derives years from dates.
  const numbers = (text: string) =>
    (text.match(/\d+(?:[.,]\d+)*/gu) ?? []).map((n) => n.replace(/[.,]/gu, ''));
  for (const entry of [...draft.resume, ...draft.cv]) {
    const cited = new Set(
      profile.claims.filter((c) => entry.claim_ids.includes(c.id)).flatMap((c) => numbers(c.text)),
    );
    if (numbers(entry.text).some((n) => !cited.has(n)))
      throw new Error('Unsupported numeric document fact');
  }
  return draft;
}
