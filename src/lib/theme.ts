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
    chart1:       'var(--color-chart-1)',
    chart2:       'var(--color-chart-2)',
    chart3:       'var(--color-chart-3)',
    // App chrome (header bar): espresso in both themes, so the iOS
    // black-translucent status bar's white text always reads on it.
    chrome:       'var(--color-chrome)',
    onChrome:     'var(--color-on-chrome)',
    // Decorative gold (rules, rings, highlights) — never body text.
    gold:         'var(--color-gold)',
    goldSoft:     'var(--color-gold-soft)',
    // Raised surfaces (sheets, popovers) and the dim layer behind them.
    elevated:     'var(--color-elevated)',
    scrim:        'var(--color-scrim)',
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
    pill: '999px',
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
    xxs:     '0.6875rem',
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
    // Below this the app is "compact": bottom tab bar + "עוד" sheet instead
    // of the desktop nav (phones, tablets, small laptops).
    compact: '@media (max-width: 1099px)',
  },
  // Mobile-first counterparts — prefer these for new layouts.
  up: {
    sm:   '@media (min-width: 601px)',
    md:   '@media (min-width: 769px)',
    wide: '@media (min-width: 1100px)',
  },
  // Safe-area insets (viewport-fit=cover). Always use with a fallback base,
  // e.g. calc(16px + theme.safe.bottom).
  safe: {
    top:    'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left:   'env(safe-area-inset-left, 0px)',
    right:  'env(safe-area-inset-right, 0px)',
  },
  layout: {
    content: '1000px',
    wide:    '1180px',
    // Comfortable line length for long Hebrew reading (siddur, texts).
    reading: '36em',
    gutter:  'clamp(16px, 4vw, 32px)',
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
  // The gilded call-to-action — same in both themes (gold reads on light and dark).
  gilded: {
    fill:   'linear-gradient(180deg, #E9C27A 0%, #C9974A 100%)',
    ink:    '#2A1A08',
    edge:   'rgba(255, 255, 255, 0.45)',
    glow:   'rgba(184, 134, 63, 0.6)',
    // Deep espresso → bronze surface for hero cards (home "today", siddur "now").
    night:  'linear-gradient(155deg, #3A2410 0%, #23150A 55%, #160D06 100%)',
    nightInk: '#FBF4E6',
    nightMuted: 'rgba(251, 244, 230, 0.72)',
    nightLine: 'rgba(226, 184, 107, 0.28)',
    nightGlow: 'radial-gradient(120% 70% at 85% -10%, rgba(226, 184, 107, 0.22), transparent 60%), radial-gradient(80% 60% at 0% 110%, rgba(155, 35, 53, 0.18), transparent 70%)',
    nightShadow: '0 18px 40px -18px rgba(35, 21, 10, 0.55)',
    nightTag: 'rgba(226, 184, 107, 0.14)',
    nightGhost: 'rgba(251, 244, 230, 0.08)',
    nightGhostHi: 'rgba(251, 244, 230, 0.14)',
    nightSkeleton: 'rgba(251, 244, 230, 0.1)',
    // Time-of-day light over the night surface (prayer "now" cards).
    dawnGlow: 'radial-gradient(110% 70% at 80% -10%, rgba(255, 196, 120, 0.34), transparent 62%)',
    duskGlow: 'radial-gradient(110% 70% at 20% -10%, rgba(226, 140, 80, 0.3), transparent 62%)',
    nightGlowCool: 'radial-gradient(110% 70% at 50% -20%, rgba(130, 150, 230, 0.2), transparent 62%)',
  },
  // Controls laid over photos/video/dark stages (feed, stories, players).
  onMedia: {
    ink:     '#FFFFFF',
    muted:   'rgba(255, 255, 255, 0.78)',
    glass:   'rgba(255, 255, 255, 0.14)',
    glassHi: 'rgba(255, 255, 255, 0.22)',
    line:    'rgba(255, 255, 255, 0.18)',
    shade:   'rgba(0, 0, 0, 0.45)',
    scrimStrong: 'rgba(20, 14, 8, 0.72)',
    lift:    '0 10px 24px -14px rgba(0, 0, 0, 0.6)',
    // Feed rail: the "liked" heart and the dark glass behind rail buttons.
    void:    '#050505',
    like:    '#FF4D67',
    likeLight: '#FF7A8C',
    likeGlow: 'rgba(255, 77, 103, 0.45)',
    rail:    'rgba(12, 9, 22, 0.42)',
    textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
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
    goldLight:  '#F0CB86',
    goldInk:    '#FFF3D6',
    rightSoft:  '#9FD8A8',
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
    // Strong ease-out for presses/entrances, ease-in-out for on-screen moves,
    // and the iOS sheet curve for drawers and bottom sheets.
    outStrong: 'cubic-bezier(0.23, 1, 0.32, 1)',
    inOut:   'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer:  'cubic-bezier(0.32, 0.72, 0, 1)',
    fast:    '0.15s',
    base:    '0.25s',
    slow:    '0.4s',
  },
  // Single z-index ladder so overlays stop competing with ad-hoc values.
  z: {
    sticky: 50,
    header: 100,
    tabbar: 110,
    fab: 140,
    drawer: 160,
    popover: 200,
    modal: 300,
    sheet: 320,
    feed: 900,
    toast: 1000,
  },
};

export type Theme = typeof theme;
