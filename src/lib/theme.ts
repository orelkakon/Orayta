export const theme = {
  colors: {
    background:   'var(--color-background)',
    surface:      'var(--color-surface)',
    surfaceAlt:   'var(--color-surface-alt)',
    primary:      'var(--color-primary)',
    primaryLight: 'var(--color-primary-light)',
    secondary:    'var(--color-secondary)',
    accent:       'var(--color-accent)',
    accentLight:  'var(--color-accent-light)',
    onPrimary:    'var(--color-on-primary)',
    secondaryText:'var(--color-secondary-text)',
    text:         'var(--color-text)',
    textMuted:    'var(--color-text-muted)',
    textLight:    'var(--color-text-light)',
    border:       'var(--color-border)',
    borderLight:  'var(--color-border-light)',
    borderStrong: 'var(--color-border-strong)',
    success:      'var(--color-success)',
    error:        'var(--color-error)',
    correct:      'var(--color-success)',
    wrong:        'var(--color-error)',
    bgSuccess:    'var(--color-bg-success)',
    bgError:      'var(--color-bg-error)',
    bgWarning:    'var(--color-bg-warning)',
  },
  fonts: {
    body: "var(--font-frank, 'Frank Ruhl Libre', Georgia, serif)",
    ui:   "var(--font-heebo, 'Heebo', system-ui, sans-serif)",
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
  spacing: {
    xs:  '4px',
    sm:  '8px',
    ms:  '12px',
    md:  '16px',
    lg:  '24px',
    xl:  '32px',
    xxl: '48px',
  },
  // Canonical type scale. Prefer these over ad-hoc rem literals so the
  // accessibility font-scale (html[data-acc-font]) stays predictable.
  fontSizes: {
    xs:      '0.75rem',
    sm:      '0.875rem',
    md:      '1rem',
    lg:      '1.125rem',
    xl:      '1.375rem',
    h2:      '1.5rem',
    h1:      '1.8rem',
    display: '2.2rem',
  },
  // Four canonical breakpoints. `media` is the ready-made query string.
  breakpoints: {
    xs: '400px',
    sm: '600px',
    md: '768px',
    lg: '1000px',
  },
  media: {
    xs: '@media (max-width: 400px)',
    sm: '@media (max-width: 600px)',
    md: '@media (max-width: 768px)',
    lg: '@media (max-width: 1000px)',
  },
  // Brand colours for third-party channels — fixed by the vendor, never themed.
  brand: {
    whatsapp: '#25D366',
    whatsappText: '#0A2E14',
    telegram: '#2AABEE',
    instagram: '#E1306C',
    linkedin: '#0077B5',
    waze: '#33CCFF',
    // Google Maps 2020 pin — the five fixed segment colors of the official icon.
    gmapsBlueDark: '#1A73E8',
    gmapsRed: '#EA4335',
    gmapsBlue: '#4285F4',
    gmapsYellow: '#FBBC04',
    gmapsGreen: '#34A853',
    brandTileBg: '#FFFFFF',
  },
  // Group quiz stage (/play) — a fixed night-and-gold stage in both themes
  // (like the feed), and the four answer colours, always paired with a shape
  // so colour is never the only cue.
  game: {
    // Warm espresso stage lit from the top — Orayta's browns and golds,
    // not a generic game-show navy.
    stage:      'radial-gradient(120% 85% at 50% 0%, #4A2F16 0%, #2A1A0C 46%, #150C05 100%)',
    stageSolid: '#21150A',
    ink:        '#FBF4E6',
    inkMuted:   'rgba(251,244,230,0.70)',
    inkFaint:   'rgba(251,244,230,0.40)',
    glass:      'rgba(255,236,210,0.07)',
    glassHi:    'rgba(255,236,210,0.13)',
    glassLine:  'rgba(226,184,107,0.20)',
    gold:       '#E2B86B',
    goldDeep:   '#B8863F',
    goldGlow:   'rgba(226,184,107,0.28)',
    onGold:     '#2A1A08',
    right:      '#3FA36B',
    rightBg:    'radial-gradient(120% 90% at 50% 0%, #1F5A3B 0%, #10301F 70%)',
    wrong:      '#D2485C',
    wrongBg:    'radial-gradient(120% 90% at 50% 0%, #6E2230 0%, #3A0E15 70%)',
    urgent:     'rgba(210,72,92,0.55)',
    // Wine · slate · amber · forest — brand-derived; blue appears once, muted.
    answers:    ['#A12A3C', '#3F5F86', '#A87420', '#2F6B4F'] as string[],
    // QR codes need maximum contrast regardless of theme.
    qrDark:     '#1A1008',
    qrLight:    '#FFFFFF',
  },

  // רבי־בוט's face — fixed in both themes so the character keeps one look.
  bot: {
    face:       '#FBEEDB',
    faceShade:  '#E2C39A',
    line:       '#3B2614',
    kippah:     '#1E130A',
    kippahHi:   '#4B3522',
    rim:        '#E2B86B',
    visor:      '#1E130A',
    visorHi:    '#5A4128',
    led:        '#FFD98A',
    ledCore:    '#FFF4D6',
    beard:      '#7A5434',
    beardHi:    '#A9805A',
    beardShade: '#5A3B22',
    bolt:       '#D2A660',
    boltDark:   '#8A6428',
    cheek:      'rgba(214,110,90,0.30)',
  },

  // Motion vocabulary — one spring + one decel curve everywhere, so the whole
  // app shares a single physical "feel" instead of per-component ad-hoc eases.
  motion: {
    spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
    out:     'cubic-bezier(0.22, 1, 0.36, 1)',
    fast:    '0.15s',
    base:    '0.25s',
    slow:    '0.4s',
  },
  // Single z-index ladder so overlays stop competing with ad-hoc values.
  z: {
    sticky: 50,
    header: 100,
    drawer: 160,
    fab: 140,
    modal: 300,
    feed: 900,
    toast: 1000,
  },
};

export type Theme = typeof theme;
