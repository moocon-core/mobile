import { useEffect, useState, type PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radius, space } from '@/constants/theme'
import { Skeleton } from '@/components/ui/skeleton'
import { ToastHost } from '@/components/ui/toast-host'
import { Txt } from '@/components/ui/txt'

const DURATION = 240
// Release past this drag, or flick faster than this, to dismiss; otherwise the panel springs back.
const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 900

/**
 * Bottom sheet: the backdrop fades while only the panel slides. The Modal itself doesn't animate,
 * so it stays mounted through the closing slide and unmounts once it finishes.
 */
export function Sheet({
  open,
  onClose,
  title,
  onShow,
  lazy,
  children,
}: PropsWithChildren<{
  open: boolean
  onClose: () => void
  title?: string
  onShow?: () => void
  /** Mount children only after the slide-in, holding their space with a placeholder; for heavy content. */
  lazy?: { placeholderHeight: number }
}>) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const [mounted, setMounted] = useState(open)
  const progress = useSharedValue(0)
  // Finger offset while dragging the panel down by its handle; added on top of the open/close slide.
  const drag = useSharedValue(0)
  const [shown, setShown] = useState(false)

  if (open && !mounted) setMounted(true)
  if (!mounted && shown) setShown(false)

  useEffect(() => {
    if (!mounted) return
    if (open) drag.value = 0
    progress.value = withTiming(open ? 1 : 0, { duration: DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (!finished) return
      if (open) runOnJS(setShown)(true)
      else runOnJS(setMounted)(false)
    })
  }, [open, mounted, progress, drag])

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onUpdate((e) => {
      // Follows the finger down; upward pulls get a little resistance instead of lifting the panel.
      drag.set(e.translationY > 0 ? e.translationY : e.translationY / 6)
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) runOnJS(onClose)()
      else drag.set(withSpring(0, { damping: 20, stiffness: 240 }))
    })

  const backdrop = useAnimatedStyle(() => ({
    opacity: progress.value * interpolate(drag.value, [0, height * 0.5], [1, 0.2], 'clamp'),
  }))
  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height + drag.value }],
  }))

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
      statusBarTranslucent
    >
      {/* A Modal is a separate native root, so gestures inside it need their own handler root. */}
      <GestureHandlerRootView style={styles.fill}>
        <KeyboardAvoidingView behavior="padding" style={styles.root}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
          </Animated.View>
          <Animated.View style={[styles.panel, { paddingBottom: insets.bottom + space.lg }, panel]}>
            <GestureDetector gesture={pan}>
              <View style={styles.handle} accessibilityHint="Drag down to close">
                <View style={styles.grabber} />
                {title ? (
                  <Txt variant="h3" style={styles.title}>
                    {title}
                  </Txt>
                ) : null}
              </View>
            </GestureDetector>
            {!lazy || shown ? (
              children
            ) : (
              <View style={[styles.placeholder, { height: lazy.placeholderHeight }]}>
                <Skeleton height={150} />
                <Skeleton height={110} />
                <Skeleton height={220} />
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
      <ToastHost />
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: colors.overlay },
  panel: {
    backgroundColor: colors.backgroundDeep,
    borderColor: colors.cardBorder,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    borderWidth: 1,
    gap: space.md,
    maxHeight: '90%',
    paddingHorizontal: space.lg,
  },
  // Generous touch target: the whole strip above the content, not just the 5px grabber.
  handle: { marginHorizontal: -space.lg, paddingBottom: space.xs, paddingHorizontal: space.lg, paddingTop: space.sm },
  grabber: {
    alignSelf: 'center',
    backgroundColor: colors.hairline,
    borderRadius: 3,
    height: 5,
    marginBottom: space.sm,
    width: 40,
  },
  title: { marginBottom: space.xs },
  placeholder: { gap: space.md, overflow: 'hidden' },
})
