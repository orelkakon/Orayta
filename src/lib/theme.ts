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
    stage:      'linear-gradient(165deg, #0A0E22 0%, #141E48 52%, #0A0C1E 100%)',
    stageSolid: '#0E1430',
    ink:        '#F7F2E4',
    inkMuted:   'rgba(247,242,228,0.68)',
    inkFaint:   'rgba(247,242,228,0.38)',
    glass:      'rgba(255,255,255,0.07)',
    glassHi:    'rgba(255,255,255,0.13)',
    glassLine:  'rgba(255,255,255,0.14)',
    gold:       '#E8CB76',
    goldDeep:   '#B8923A',
    onGold:     '#241A05',
    right:      '#2FB463',
    rightBg:    'linear-gradient(165deg, #0E3B24 0%, #16603A 100%)',
    wrong:      '#E0475B',
    wrongBg:    'linear-gradient(165deg, #3E0E17 0%, #6B1A27 100%)',
    answers:    ['#E0354B', '#2F6FD6', '#D9A21B', '#2E9A4A'] as string[],
    // QR codes need maximum contrast regardless of theme.
    qrDark:     '#0A0E22',
    qrLight:    '#FFFFFF',
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
