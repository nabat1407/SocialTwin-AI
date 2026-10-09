import type { Package, Profile } from './schemas';

export type DocumentKind = 'resume' | 'cv' | 'letter' | 'plan';
export const sectionLabels = {
  az: {
    summary: 'PROFİL',
    education: 'TƏHSİL',
    experience: 'İŞ TƏCRÜBƏSİ',
    projects: 'LAYİHƏLƏR',
    skills: 'BACARIQLAR',
    languages: 'DİL BİLİKLƏRİ',
    research: 'TƏDQİQAT',
    publications: 'NƏŞRLƏR',
    awards: 'MÜKAFATLAR',
    volunteering: 'KÖNÜLLÜLÜK',
  },
  tr: {
    summary: 'PROFİL',
    education: 'EĞİTİM',
    experience: 'İŞ DENEYİMİ',
    projects: 'PROJELER',
    skills: 'BECERİLER',
    languages: 'DİL BİLGİSİ',
    research: 'ARAŞTIRMA',
    publications: 'YAYINLAR',
    awards: 'ÖDÜLLER',
    volunteering: 'GÖNÜLLÜLÜK',
  },
  en: {
    summary: 'PROFILE',
    education: 'EDUCATION',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    skills: 'SKILLS',
    languages: 'LANGUAGES',
    research: 'RESEARCH',
    publications: 'PUBLICATIONS',
    awards: 'AWARDS',
    volunteering: 'VOLUNTEERING',
  },
};
export function formatDocument(profile: Profile, pack: Package, kind: DocumentKind) {
  if (pack.profile_revision !== profile.revision) throw new Error('Stale package');
  if (kind === 'plan') {
    const labels = {
      az: ['HAZIRLIQ PLANI', 'Nəticə', 'Təxmini vaxt', 'dəqiqə'],
      tr: ['HAZIRLIK PLANI', 'Çıktı', 'Tahmini süre', 'dakika'],
      en: ['PREPARATION PLAN', 'Deliverable', 'Estimated time', 'minutes'],
    }[profile.locale];
    return [
      labels[0],
      pack.opportunity_name ?? '',
      '',
      ...pack.draft.action_plan.flatMap((item, i) => [
        `${i + 1}. ${item.title}`,
        `${labels[1]}: ${item.deliverable}`,
        `${labels[2]}: ${item.estimated_minutes} ${labels[3]}`,
        '',
      ]),
    ]
      .join('\n')
      .trim();
  }
  if (kind === 'letter') {
    const body = pack.draft.letter.map((p) => p.text).join('\n\n');
    if (!body) return body;
    const letterContact = [profile.contact?.email, profile.contact?.phone, profile.contact?.website]
      .filter(Boolean)
      .join(' · ');
    const letterHeader = [profile.name, letterContact].filter(Boolean).join('\n');
    const greeting = {
      az: `Hörmətli ${pack.opportunity_organization} komandası,`,
      tr: `Sayın ${pack.opportunity_organization} ekibi,`,
      en: `Dear ${pack.opportunity_organization} team,`,
    }[profile.locale];
    // Addressing is metadata, not a candidate claim. Render it deterministically
    // from the catalog to avoid model typos in committee/team salutations.
    const letterBody = pack.opportunity_organization
      ? `${greeting}\n\n${body.replace(/^(?:Hörmətli|Sayın|Dear)\s+[^,\n]+[,،]\s*/u, '')}`
      : body;
    return [letterHeader, letterBody].filter(Boolean).join('\n\n');
  }
  const labels = sectionLabels[profile.locale];
  const entries = pack.draft[kind];
  let order: (keyof typeof labels)[] = [
    'summary',
    'education',
    'experience',
    'projects',
    'research',
    'publications',
    'skills',
    'languages',
    'awards',
    'volunteering',
  ];
  if (kind === 'resume' && entries.some((entry) => entry.section === 'experience'))
    order = [
      'summary',
      'experience',
      'projects',
      'education',
      'skills',
      'languages',
      'research',
      'publications',
      'awards',
      'volunteering',
    ];
  const sections = order.flatMap((section) => {
    let group = entries.filter((entry) => (entry.section ?? 'experience') === section);
    if (!group.length) return [];
    if (!['summary', 'skills', 'languages'].includes(section)) {
      const dated = group.map((entry) => ({
        entry,
        years: entry.text.match(/\b(?:19|20)\d{2}\b/gu),
      }));
      if (dated.every((item) => item.years?.length))
        group = dated
          .sort((a, b) => Math.max(...b.years!.map(Number)) - Math.max(...a.years!.map(Number)))
          .map((item) => item.entry);
    }
    return [
      labels[section],
      ...group.map((entry) =>
        section === 'summary' || section === 'education' ? entry.text : `• ${entry.text}`,
      ),
      '',
    ];
  });
  const contact = [profile.contact?.email, profile.contact?.phone, profile.contact?.website]
    .filter(Boolean)
    .join(' · ');
  const role =
    profile.target_role &&
    !/axtar|istəy|looking|seeking|apply|arıyorum|təqaüd|scholarship|işi\s+və|təcrübə\s+proqram|vakansiy|opportunities|^iş\s+və\s+təcrübə$/iu.test(
      profile.target_role.trim().toLocaleLowerCase('az'),
    )
      ? profile.target_role
      : '';
  return [profile.name || '', contact, role, '', ...sections].join('\n').trim();
}

export function exportText(pack: Package, document: string) {
  return `${pack.mode === 'fixture' ? 'DEMO / NÜMUNƏ\n\n' : ''}${document}`;
}
