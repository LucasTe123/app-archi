// src/theme/index.ts

export const colors = {
  // Fondos
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1C1C1C',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',

  // Textos
  textPrimary: '#F0F0F0',
  textSecondary: '#888888',
  textFaint: '#444444',

  // Acento principal (blanco puro — minimalista)
  accent: '#FFFFFF',
  accentMuted: 'rgba(255,255,255,0.12)',

  // Estados
  success: '#4CAF50',
  error: '#FF4444',
  warning: '#FF9800',
};

export const typography = {
  // Familia — usa la fuente del sistema (San Francisco en iOS, Roboto en Android)
  // Limpia y nativa, sin imports externos
  fontRegular: undefined,   // default del sistema
  fontMedium: undefined,
  fontSemiBold: undefined,
  fontBold: undefined,

  // Tamaños
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 34,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};