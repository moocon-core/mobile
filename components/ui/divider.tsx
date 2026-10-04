import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '@/constants/theme'

export function Divider({ spacing = 24 }: { spacing?: number }) {
  return (
    <LinearGradient
      colors={['transparent', colors.cardBorder, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 1, marginVertical: spacing }}
    />
  )
}
