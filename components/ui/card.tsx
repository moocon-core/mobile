import { View, type ViewProps } from 'react-native'
import { colors, radius, space } from '@/constants/theme'

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          borderRadius: radius.xl,
          padding: space.lg,
        },
        style,
      ]}
      {...rest}
    />
  )
}
