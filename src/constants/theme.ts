import { Colors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.charcoal,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.charcoal,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.charcoal,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.charcoal,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.charcoal,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textLight,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#0F332A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F332A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F332A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
};
