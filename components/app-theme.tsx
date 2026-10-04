import { PropsWithChildren } from 'react'
import { DarkTheme, ThemeProvider } from 'expo-router'
import { colors } from '@/constants/theme'

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.backgroundDeep,
    border: colors.hairline,
    primary: colors.accent,
    text: colors.foreground,
  },
}

export function AppTheme({ children }: PropsWithChildren) {
  return <ThemeProvider value={theme}>{children}</ThemeProvider>
}
