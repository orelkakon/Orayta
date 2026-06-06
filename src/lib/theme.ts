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
    text:         'var(--color-text)',
    textMuted:    'var(--color-text-muted)',
    textLight:    'var(--color-text-light)',
    border:       'var(--color-border)',
    borderLight:  'var(--color-border-light)',
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
    md:  '16px',
    lg:  '24px',
    xl:  '32px',
    xxl: '48px',
  },
};

export type Theme = typeof theme;
