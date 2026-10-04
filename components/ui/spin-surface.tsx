import { useEffect, useState, type PropsWithChildren } from 'react'
import { AccessibilityInfo, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

// Mirrors web `.spin-button` (app/src/index.css): 1px border lit by a rotating light, dark gradient surface.
const BEAM = [
  'transparent',
  'transparent',
  'rgba(59, 130, 246, 0.08)',
  '#3b82f6',
  '#38bdf8',
  'rgba(245, 246, 247, 0.92)',
  'rgba(59, 130, 246, 0.16)',
  'transparent',
] as const
// RN has no conic gradient: a beam over half the rotating square sweeps the border the same way.
const BEAM_STOPS = [0, 0.5, 0.57, 0.66, 0.73, 0.78, 0.86, 1] as const
const SURFACE = ['rgba(17, 23, 41, 0.99)', 'rgba(7, 10, 20, 0.98)'] as const
const SPIN_MS = 4500

export function SpinSurface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const rotation = useSharedValue(25)

  useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return
      rotation.value = withRepeat(withTiming(385, { duration: SPIN_MS, easing: Easing.linear }), -1, false)
    })
    return () => {
      active = false
      cancelAnimation(rotation)
    }
  }, [rotation])

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))
  const beam = Math.hypot(size.width, size.height)

  return (
    <View
      style={[styles.root, style]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <View style={styles.clip} pointerEvents="none">
        {beam > 0 ? (
          <Animated.View
            style={[
              {
                height: beam,
                left: (size.width - beam) / 2,
                position: 'absolute',
                top: (size.height - beam) / 2,
                width: beam,
              },
              spin,
            ]}
          >
            <LinearGradient
              colors={BEAM}
              locations={BEAM_STOPS}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : null}
        <LinearGradient colors={SURFACE} start={{ x: 0, y: 0.3 }} end={{ x: 1, y: 0.7 }} style={styles.surface} />
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 15,
  },
  clip: { borderRadius: 999, bottom: 0, left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 },
  surface: { borderRadius: 999, bottom: 1, left: 1, position: 'absolute', right: 1, top: 1 },
})
