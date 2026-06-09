// reference/design-tokens.ts
// Tokens en TS — utile pour styles inline, libs de graph, ou tout endroit
// hors Tailwind. La source de vérité reste tailwind.config.js (voir 01-design-system.md).

export const colors = {
  paper: '#EEE8DC',
  cream: '#FBF8F1',
  ink: '#23201A',
  inkSoft: '#5C534A',
  muted: '#9A8F80',
  ember: '#B5532A',
  emberDark: '#964123',
  emberSoft: '#EBDDD2',
  olive: '#6C6A48',
  line: '#D8D0C1',
  lineSoft: '#E7DFD1',
  creamlight: '#FBF6EE', // texte sur ember
} as const;

export const fonts = {
  display: '"Marcellus", Georgia, serif',
  body: '"Spectral", Georgia, serif',
  label: '"Archivo", system-ui, sans-serif',
} as const;

export const type = {
  h1: { family: fonts.display, size: 60, lineHeight: 1.04 }, // 34 en mobile
  h2: { family: fonts.display, size: 26, lineHeight: 1.1 },
  recipeTitle: { family: fonts.display, size: 26, lineHeight: 1.1 },
  body: { family: fonts.body, size: 17 },
  kicker: { family: fonts.label, size: 11, tracking: '0.16em', uppercase: true },
} as const;

export const radius = { none: 0, full: 9999 } as const;
export const stroke = { hairline: 1, field: 1.5 } as const;
