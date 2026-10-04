import { useEffect } from 'react'
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { colors, radius } from '@/constants/theme'

export function Skeleton({
  width,
  height,
  round,
  style,
}: {
  width?: DimensionValue
  height: number
  round?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const opacity = useSharedValue(0.5)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
  }, [opacity])
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.skeleton,
          borderRadius: round ? radius.pill : radius.sm,
          height,
          width: round ? height : (width ?? '100%'),
        },
        animated,
        style,
      ]}
    />
  )
}
