export const theme = {
  colors: {
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F0E8',
    primary: '#5C3D1E',
    primaryLight: '#8B6240',
    secondary: '#C4956A',
    accent: '#9B2335',
    accentLight: '#C94B5F',
    text: '#2C1810',
    textMuted: '#6B5744',
    textLight: '#9B8575',
    border: '#E0D5C5',
    borderLight: '#EDE8DE',
    success: '#2D6A4F',
    error: '#9B2335',
    correct: '#2D6A4F',
    wrong: '#9B2335',
  },
  fonts: {
    body: "var(--font-frank, 'Frank Ruhl Libre', Georgia, serif)",
    ui: "var(--font-heebo, 'Heebo', system-ui, sans-serif)",
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    sm: '0 1px 3px rgba(44,24,16,0.08)',
    md: '0 4px 12px rgba(44,24,16,0.10)',
    lg: '0 8px 24px rgba(44,24,16,0.12)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

export type Theme = typeof theme;
