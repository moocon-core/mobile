import { useEffect, useState } from 'react'
import { AccessibilityInfo, StyleSheet, View } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import type { VaultWithAddress } from '@moocon/shared'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'
import { useVaultCountdown } from '@/lib/hooks/use-vault-countdown'
import { useMintStore } from '@/lib/mint-store'

const SECONDS_PER_ITEM = 5
// Each copy only has to outrun the screen width for the loop to look seamless.
const MIN_ITEMS_PER_COPY = 4

export function VaultTicker({ vaults }: { vaults: VaultWithAddress[] }) {
  const [copyWidth, setCopyWidth] = useState(0)
  const offset = useSharedValue(0)
  const repeats = Math.max(1, Math.ceil(MIN_ITEMS_PER_COPY / Math.max(1, vaults.length)))
  const durationMs = vaults.length * repeats * SECONDS_PER_ITEM * 1000

  useEffect(() => {
    if (copyWidth <= 0 || durationMs <= 0) return
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return
      // Resume from the current position: a width change (a timer flipping to DRAWING…) mustn't snap the strip back.
      const start = -(-offset.value % copyWidth)
      const remaining = durationMs * ((copyWidth + start) / copyWidth)
      offset.value = start
      offset.value = withSequence(
        withTiming(-copyWidth, { duration: remaining, easing: Easing.linear }),
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-copyWidth, { duration: durationMs, easing: Easing.linear }),
          ),
          -1,
          false,
        ),
      )
    })
    return () => {
      active = false
      cancelAnimation(offset)
    }
  }, [copyWidth, durationMs, offset])

  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }))

  if (vaults.length === 0) return null

  return (
    <View style={styles.root} accessibilityRole="summary" accessibilityLabel="Next draw countdowns">
      <Animated.View style={[styles.track, trackStyle]}>
        {[0, 1].map((copy) => (
          <View
            key={copy}
            style={styles.copy}
            onLayout={copy === 0 ? (e) => setCopyWidth(e.nativeEvent.layout.width) : undefined}
            importantForAccessibility={copy === 1 ? 'no-hide-descendants' : 'auto'}
          >
            {Array.from({ length: repeats }).flatMap((_, r) =>
              vaults.map((vault) => <TickerItem key={`${r}-${vault.address.toBase58()}`} vault={vault} />),
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  )
}

function TickerItem({ vault }: { vault: VaultWithAddress }) {
  const mint = useMintStore((s) => s.getMint(vault.mint.toBase58()))
  const countdown = useVaultCountdown(vault.distributionTiers, 'mmss')
  const isReady = countdown === '00:00'
  return (
    <View style={styles.item}>
      <TokenIcon uri={mint?.icon} size={18} />
      <Txt style={styles.symbol}>{mint?.symbol ?? `${vault.mint.toBase58().slice(0, 4)}…`}</Txt>
      <Txt style={styles.dot}>·</Txt>
      <Txt style={[styles.countdown, isReady && styles.ready]}>{isReady ? 'DRAWING…' : countdown || '—'}</Txt>
      <Txt style={styles.separator}>{'//'}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'rgba(10, 15, 30, 0.8)',
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    overflow: 'hidden',
    paddingVertical: space.sm,
  },
  track: { flexDirection: 'row' },
  copy: { flexDirection: 'row' },
  item: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  symbol: { color: colors.accentSoft, fontSize: 11, fontWeight: '700', letterSpacing: 1.8 },
  dot: { color: '#475569', fontSize: 11 },
  countdown: { color: colors.foreground, fontFamily: 'SpaceMono', fontSize: 12 },
  ready: { color: colors.cyan },
  separator: {
    color: 'rgba(96, 165, 250, 0.45)',
    fontSize: 11,
    fontWeight: '700',
    // The item's 6px gap already sits before the separator.
    marginLeft: space.lg - 6,
    marginRight: space.lg,
  },
})
