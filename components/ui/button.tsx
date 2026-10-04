import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SpinSurface } from '@/components/ui/spin-surface'
import { colors, radius } from '@/constants/theme'

type Variant = 'spin' | 'stake' | 'ghost'

export function Button({
  label,
  variant = 'spin',
  size = 'md',
  loading,
  disabled,
  style,
  ...rest
}: PressableProps & {
  label: string
  variant?: Variant
  size?: 'sm' | 'md'
  loading?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const inactive = disabled || loading
  const content = loading ? (
    <ActivityIndicator color={variant === 'ghost' ? colors.foreground : colors.accent} />
  ) : (
    <Text
      style={[
        styles.text,
        variant === 'spin' ? styles.spinText : variants[variant].text,
        size === 'sm' && styles.smText,
      ]}
    >
      {label}
    </Text>
  )

  if (variant === 'spin') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={inactive}
        // Android fades each layer separately; the spinning beam would show through a dimmed surface.
        needsOffscreenAlphaCompositing={Boolean(inactive)}
        style={[inactive && styles.disabled, style]}
        {...rest}
      >
        {({ pressed }) => (
          <SpinSurface style={[styles.spin, size === 'sm' && styles.sm, pressed && styles.pressed]}>
            {content}
          </SpinSurface>
        )}
      </Pressable>
    )
  }

  const v = variants[variant]
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      style={({ pressed }) => [styles.base, v.container, pressed && v.pressed, inactive && styles.disabled, style]}
      {...rest}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  spin: { alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingHorizontal: 22 },
  sm: { minHeight: 36, paddingHorizontal: 18 },
  smText: { fontSize: 11 },
  pressed: { transform: [{ scale: 0.97 }] },
  text: { fontSize: 15, fontWeight: '700' },
  spinText: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  disabled: { opacity: 0.5 },
})

const variants = {
  stake: StyleSheet.create({
    container: { backgroundColor: colors.stakeBackground, borderColor: colors.cardBorder, borderWidth: 1 },
    pressed: { backgroundColor: colors.cardRaised },
    text: { color: colors.accent },
  }),
  ghost: StyleSheet.create({
    container: { borderColor: colors.hairline, borderWidth: 1 },
    pressed: { backgroundColor: colors.cardRaised },
    text: { color: colors.foreground },
  }),
}
