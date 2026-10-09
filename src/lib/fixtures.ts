import type { Opportunity } from './schemas';

// Synthetic examples only: never presented as verified or available opportunities.
export const scenarios = [
  {
    id: 'cs',
    label: 'CS tələbəsi',
    text: 'Kompüter elmləri üzrə 3-cü kurs tələbəsiyəm. Python və SQL bilirəm. Python ilə məlumat təhlili layihəsi hazırlamışam. AI sahəsində təcrübə proqramı axtarıram.',
    draft: {
      name: '',
      target_role: 'AI təcrübəçisi',
      education: 'Kompüter elmləri, 3-cü kurs tələbəsi',
      skills: ['Python', 'SQL'],
      claims: [
        'Kompüter elmləri üzrə 3-cü kurs tələbəsiyəm.',
        'Python və SQL bilirəm.',
        'Python ilə məlumat təhlili layihəsi hazırlamışam.',
      ],
      missing_information: ['Layihədə şəxsi töhfəniz nə olub?', 'GitHub portfolyonuz varmı?'],
    },
  },
  {
    id: 'economics',
    label: 'İqtisadiyyat tələbəsi',
    text: 'İqtisadiyyat üzrə 4-cü kurs tələbəsiyəm. Excel və məlumat təhlili bilirəm. Universitetdə iqtisadi araşdırma layihəsində iştirak etmişəm. Beynəlxalq təqaüd axtarıram.',
    draft: {
      name: '',
      target_role: 'Beynəlxalq təqaüd',
      education: 'İqtisadiyyat, 4-cü kurs tələbəsi',
      skills: ['Excel', 'Məlumat təhlili'],
      claims: [
        'İqtisadiyyat üzrə 4-cü kurs tələbəsiyəm.',
        'Excel və məlumat təhlili bilirəm.',
        'Universitetdə iqtisadi araşdırma layihəsində iştirak etmişəm.',
      ],
      missing_information: [
        'İngilis dili səviyyəniz və imtahan nəticəniz varmı?',
        'Akademik göstəriciləriniz necədir?',
      ],
    },
  },
  {
    id: 'career',
    label: 'Karyera dəyişikliyi',
    text: 'Satış sahəsində çalışmışam. Müştərilərlə ünsiyyət və Excel bacarıqlarım var. SQL öyrənirəm. Junior data analyst vəzifəsi üçün CV hazırlamaq istəyirəm.',
    draft: {
      name: '',
      target_role: 'Junior data analyst',
      education: '',
      skills: ['Müştərilərlə ünsiyyət', 'Excel'],
      claims: [
        'Satış sahəsində çalışmışam.',
        'Müştərilərlə ünsiyyət və Excel bacarıqlarım var.',
        'SQL öyrənirəm.',
      ],
      missing_information: [
        'İş təcrübənizin tarixlərini əlavə edin.',
        'SQL üzrə hansı praktiki işi göstərmək olar?',
      ],
    },
  },
] as const;

export const fixtureOpportunities: Opportunity[] = [
  {
    id: 'demo-ai',
    name: 'AI & Data Internship',
    organization: 'Nümunə təşkilat',
    category: 'internship',
    location: 'Bakı · Hibrid',
    description:
      'Profil, bacarıq və sənəd tələblərinin necə müqayisə edildiyini göstərən uydurma demo ssenarisi.',
    deadline: { kind: 'rolling', date: null },
    source_url: null,
    verified_at: null,
    verification_status: 'pending',
    fixture: true,
    requirements: [
      {
        id: 'ai-student',
        label: 'Kompüter elmləri tələbəsi',
        kind: 'eligibility',
        mandatory: true,
        criterion: { field: 'education', term: 'Kompüter elmləri' },
      },
      {
        id: 'ai-python',
        label: 'Python',
        kind: 'skill',
        mandatory: true,
        criterion: { field: 'skills', term: 'Python' },
      },
      {
        id: 'ai-sql',
        label: 'SQL',
        kind: 'skill',
        mandatory: false,
        criterion: { field: 'skills', term: 'SQL' },
      },
      {
        id: 'ai-portfolio',
        label: 'GitHub portfolyosu',
        kind: 'document',
        mandatory: true,
        criterion: { field: 'document', term: 'GitHub' },
      },
      {
        id: 'ai-letter',
        label: 'Motivasiya məktubu',
        kind: 'document',
        mandatory: true,
        criterion: { field: 'document', term: 'letter' },
      },
    ],
  },
  {
    id: 'demo-scholarship',
    name: 'International Study Scholarship',
    organization: 'Nümunə universitet',
    category: 'scholarship',
    location: 'Beynəlxalq',
    description:
      'Təqaüd hazırlıq paketini yoxlamaq üçün sintetik ssenari. Aktiv təqaüd elanı deyil.',
    deadline: { kind: 'rolling', date: null },
    source_url: null,
    verified_at: null,
    verification_status: 'pending',
    fixture: true,
    requirements: [
      {
        id: 'sch-student',
        label: 'İqtisadiyyat üzrə təhsil',
        kind: 'eligibility',
        mandatory: true,
        criterion: { field: 'education', term: 'İqtisadiyyat' },
      },
      {
        id: 'sch-excel',
        label: 'Excel',
        kind: 'skill',
        mandatory: false,
        criterion: { field: 'skills', term: 'Excel' },
      },
      {
        id: 'sch-language',
        label: 'İngilis dili nəticəsi',
        kind: 'document',
        mandatory: true,
        criterion: { field: 'document', term: 'language' },
      },
      {
        id: 'sch-letter',
        label: 'Motivasiya məktubu',
        kind: 'document',
        mandatory: true,
        criterion: { field: 'document', term: 'letter' },
      },
    ],
  },
  {
    id: 'demo-job',
    name: 'Junior Data Analyst',
    organization: 'Nümunə işəgötürən',
    category: 'job',
    location: 'Bakı · Ofis',
    description:
      'İş axtaranlar üçün təcrübədən hədəf CV-yə keçidi göstərən demo. Real vakansiya deyil.',
    deadline: { kind: 'rolling', date: null },
    source_url: null,
    verified_at: null,
    verification_status: 'pending',
    fixture: true,
    requirements: [
      {
        id: 'job-excel',
        label: 'Excel',
        kind: 'skill',
        mandatory: true,
        criterion: { field: 'skills', term: 'Excel' },
      },
      {
        id: 'job-sql',
        label: 'SQL',
        kind: 'skill',
        mandatory: true,
        criterion: { field: 'skills', term: 'SQL' },
      },
      {
        id: 'job-communication',
        label: 'Müştərilərlə ünsiyyət',
        kind: 'skill',
        mandatory: false,
        criterion: { field: 'skills', term: 'Müştərilərlə ünsiyyət' },
      },
      {
        id: 'job-cv',
        label: 'Hədəfə uyğun CV',
        kind: 'document',
        mandatory: true,
        criterion: { field: 'document', term: 'cv' },
      },
    ],
  },
];
