import { StyleSheet } from 'react-native'

// Mirrors APP_COLORS in app/src/consts.ts; keep the two palettes in step.
export const colors = {
  background: '#0E162B',
  backgroundDeep: '#0B1120',
  foreground: '#E2E8F0',
  title: '#F1F5F9',
  muted: '#94A3B8',
  subtle: '#64748B',
  accent: '#60A5FA',
  accentSoft: '#93C5FD',
  primary: '#3B82F6',
  primaryPressed: '#2563EB',
  indigo: '#818CF8',
  cyan: '#7DD3FC',
  card: 'rgba(17, 24, 39, 0.72)',
  cardSolid: '#111827',
  cardRaised: '#1E293B',
  cardBorder: 'rgba(37, 99, 235, 0.25)',
  hairline: 'rgba(255, 255, 255, 0.1)',
  inputBackground: 'rgba(7, 10, 20, 0.55)',
  stakeBackground: '#0F1D3A',
  skeleton: 'rgba(37, 99, 235, 0.18)',
  success: '#34D399',
  error: '#F87171',
  overlay: 'rgba(2, 6, 18, 0.7)',
} as const

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const

export const type = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.accent },
  title: { fontSize: 26, fontWeight: '800', color: colors.title },
  h2: { fontSize: 22, fontWeight: '700', color: colors.title },
  h3: { fontSize: 17, fontWeight: '700', color: colors.title },
  body: { fontSize: 15, color: colors.foreground },
  small: { fontSize: 13, color: colors.muted },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent },
  value: { fontSize: 18, fontWeight: '700', color: colors.foreground, fontVariant: ['tabular-nums'] },
})
