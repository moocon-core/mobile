import { useEffect, type RefObject } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { router, usePathname, type Href } from 'expo-router'
import { ChartSpline, Landmark, WalletMinimal, type LucideIcon } from 'lucide-react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/constants/theme'

const TABS: { href: Href & string; label: string; Icon: LucideIcon }[] = [
  { href: '/', label: 'Vaults', Icon: Landmark },
  { href: '/analytics', label: 'Analytics', Icon: ChartSpline },
  { href: '/portfolio', label: 'Portfolio', Icon: WalletMinimal },
]

const ITEM_WIDTH = 76
const ITEM_HEIGHT = 36
const PADDING = 4
const BOTTOM_GAP = 10
/** Vertical space a tab screen must leave free below its content for the floating bar. */
export const FLOATING_TAB_BAR_SPACE = ITEM_HEIGHT + PADDING * 2 + BOTTOM_GAP + 16

/**
 * Web navbar's glass pill (app-header.tsx: bg rgba(11,17,32,0.6), backdrop-blur-xl, white/10 border).
 * Rendered outside the tab screens so it can blur them through `blurTarget`.
 */
export function FloatingTabBar({ blurTarget }: { blurTarget: RefObject<View | null> }) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const active = Math.max(
    0,
    TABS.findIndex((t) => (t.href === '/' ? pathname === '/' : pathname.startsWith(t.href))),
  )
  const x = useSharedValue(active * ITEM_WIDTH)

  const slideTo = (index: number) => {
    x.value = withTiming(index * ITEM_WIDTH, { duration: 200, easing: Easing.out(Easing.cubic) })
  }

  // Covers route changes that don't come from the bar (deep links, back).
  useEffect(() => {
    slideTo(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + BOTTOM_GAP }]}>
      <View style={styles.shadow}>
        <View style={styles.bar}>
          <BlurView
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.tint} pointerEvents="none" />
          <Animated.View style={[styles.highlight, highlight]} pointerEvents="none" />
          {TABS.map(({ href, label, Icon }, i) => {
            const focused = i === active
            return (
              <Pressable
                key={href}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: focused }}
                hitSlop={4}
                onPress={() => {
                  if (focused) return
                  Haptics.selectionAsync().catch(() => {})
                  slideTo(i)
                  router.navigate(href)
                }}
                style={styles.item}
              >
                <Icon size={20} strokeWidth={focused ? 2.2 : 1.8} color={focused ? colors.accent : colors.muted} />
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', left: 0, position: 'absolute', right: 0 },
  shadow: {
    borderRadius: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  bar: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: PADDING,
  },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11, 17, 32, 0.6)' },
  highlight: {
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    borderColor: 'rgba(96, 165, 250, 0.22)',
    borderRadius: 999,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: PADDING,
    position: 'absolute',
    top: PADDING,
    width: ITEM_WIDTH,
  },
  item: { alignItems: 'center', height: ITEM_HEIGHT, justifyContent: 'center', width: ITEM_WIDTH },
})
