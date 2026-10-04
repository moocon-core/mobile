import { Pressable, StyleSheet, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Animated, { FadeOut, SlideInUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useToastStore } from '@/lib/toast'

/**
 * Top-of-screen toast. Mounted at the root and inside every Sheet: a sheet is an RN Modal,
 * which would otherwise cover a toast rendered underneath it.
 */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast)
  const dismiss = useToastStore((s) => s.dismiss)
  const insets = useSafeAreaInsets()
  if (!toast) return null
  const error = toast.kind === 'error'
  const { icon, color } = KIND[toast.kind]

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + space.sm }]}>
      <Animated.View
        key={toast.id}
        entering={SlideInUp.duration(220)}
        exiting={FadeOut.duration(180)}
        style={[styles.toast, styles[toast.kind]]}
      >
        <Pressable
          onPress={dismiss}
          accessibilityRole="alert"
          accessibilityLabel={toast.text}
          accessibilityHint="Dismiss"
          style={styles.body}
        >
          <Feather name={icon} size={16} color={color} />
          <View style={styles.texts}>
            <Txt style={[styles.text, error && styles.errorText]} numberOfLines={3}>
              {toast.text}
            </Txt>
            {toast.detail ? (
              <Txt style={styles.detail} numberOfLines={2}>
                {toast.detail}
              </Txt>
            ) : null}
          </View>
        </Pressable>
        {toast.action ? (
          <Pressable
            onPress={() => {
              toast.action?.onPress()
              dismiss()
            }}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Txt style={styles.action}>{toast.action.label}</Txt>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  )
}

const KIND = {
  success: { icon: 'check-circle', color: colors.success },
  error: { icon: 'alert-circle', color: colors.error },
  info: { icon: 'x-circle', color: colors.muted },
} as const

const styles = StyleSheet.create({
  wrap: { left: space.lg, position: 'absolute', right: space.lg, zIndex: 1000 },
  toast: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 12,
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    shadowColor: '#000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  success: { backgroundColor: colors.cardRaised, borderColor: 'rgba(52, 211, 153, 0.35)' },
  error: { backgroundColor: '#3B1219', borderColor: 'rgba(248, 113, 113, 0.4)' },
  info: { backgroundColor: colors.cardRaised, borderColor: colors.hairline },
  texts: { flex: 1, gap: 2 },
  detail: { color: colors.muted, fontSize: 12 },
  body: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: space.sm },
  text: { color: colors.foreground, fontSize: 13, fontWeight: '500' },
  errorText: { color: '#FECACA' },
  action: { color: colors.accent, fontSize: 13, fontWeight: '700' },
})
