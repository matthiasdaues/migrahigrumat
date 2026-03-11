// Quiz data — source: .claude/brief.md
export const categories = [
  {
    id: 'A',
    title: 'Kategorie A: Herkunftsnarrativ',
    options: [
      { label: 'Gastarbeiterkind', score: 4 },
      { label: 'Kind von Expat / Diplomat / westlichem Berufsaufsteiger', score: 0 },
      { label: 'Elternteil aus NATO-Staat', score: -2 },
      { label: 'Elternteil aus „postkolonial anschlussfähigem" Raum', score: 3 },
    ],
  },
  {
    id: 'B',
    title: 'Kategorie B: Klassenanschlussfähigkeit',
    options: [
      { label: 'Arbeiterhaushalt', score: 4 },
      { label: 'Akademikerhaushalt', score: 0 },
      { label: 'Beamtenhaushalt', score: -1 },
      { label: 'Wohlstand ohne proletarische Erzählbarkeit', score: -3 },
    ],
  },
  {
    id: 'C',
    title: 'Kategorie C: Verwertbarkeit im Haltungsdiskurs',
    options: [
      { label: 'Biografie bestätigt linkes Weltbild', score: 5 },
      { label: 'Biografie widerspricht linkem Weltbild', score: -5 },
      { label: 'Erfolgreiche Integration ohne Daueranklage gegen Mehrheitsgesellschaft', score: -4 },
      {
        label: 'Öffentliche Berufung auf Eigenleistung',
        score: null, // special: triggers Betroffenheitsrat review
        special: 'betroffenheitsrat',
      },
    ],
  },
  {
    id: 'D',
    title: 'Kategorie D: Symbolische Diskriminierungsrendite',
    options: [
      { label: 'Nachweisbare Fremdzuschreibung im Alltag', score: 3 },
      { label: 'Aufstieg trotz widriger Startbedingungen', score: 2 },
      { label: 'Zu erfolgreich, zu angepasst, zu staatstragend', score: -4 },
      {
        label: 'CDU / konservativ / liberal',
        score: null, // special: automatic Herabstufung
        special: 'herabstufung',
      },
    ],
  },
  {
    id: 'E',
    title: 'Kategorie E: Politische Anschlussverwendung',
    options: [
      { label: 'Eignet sich als Beleg gegen „strukturelle Privilegien"', score: 4 },
      { label: 'Eignet sich als Gegenbeispiel gegen linke Erzählmuster', score: -6 },
      {
        label: 'Könnte zeigen, dass Integration auch mit Leistung, Familie und Eigenverantwortung zu tun hat',
        score: -8,
      },
    ],
  },
];

export const results = [
  {
    min: 20,
    max: Infinity,
    label: 'Goldstandard legitimer Betroffenheit',
    description: 'Ihre Biografie erfüllt alle normativen Anforderungen des progressiven Diskurses. Herzlichen Glückwunsch.',
  },
  {
    min: 10,
    max: 19,
    label: 'Migra, aber nur mit Vorbehalt',
    description: 'Grundsätzlich anschlussfähig. Einige biografische Unschärfen erfordern fortlaufende Prüfung.',
  },
  {
    min: 1,
    max: 9,
    label: 'Formal Migra, praktisch problematisch',
    description: 'Migrationshintergrund formal gegeben. Diskursive Verwertbarkeit stark eingeschränkt.',
  },
  {
    min: -Infinity,
    max: 0,
    label: '„Rechter Token" / integrationsverdächtig / soziologisch zu exkommunizieren',
    description: 'Ihre Lebensgeschichte widerspricht strukturell den Anforderungen legitimer Betroffenheit. Bitte konsultieren Sie Ihren Betroffenheitsrat.',
  },
];

export const SPECIAL_SCORE_HERABSTUFUNG = -6;
export const SPECIAL_SCORE_BETROFFENHEITSRAT = 0;
