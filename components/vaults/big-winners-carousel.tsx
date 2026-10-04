import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import {
  formatApr,
  formatDrawDate,
  formatPrizeUsd,
  formatTokenAmount,
  resolveMintDecimals,
  resolvePayout,
  shortKey,
  type Drawing,
} from '@moocon/shared'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'
import { useTopDrawings } from '@/lib/queries/use-drawings'

const MAX_WINNERS = 8
const CARD_WIDTH = 210
const GAP = space.sm

/** Compact Hall of Fame strip; each card opens the round's proof. */
export function BigWinnersCarousel({ onSelect }: { onSelect?: (drawing: Drawing) => void }) {
  const { data } = useTopDrawings(MAX_WINNERS)
  const getMint = useMintStore((s) => s.getMint)

  if (!data) {
    return (
      <View style={styles.row}>
        {[0, 1].map((k) => (
          <Skeleton key={k} width={CARD_WIDTH} height={110} style={styles.skeleton} />
        ))}
      </View>
    )
  }

  const drawings = data.drawings ?? []
  if (drawings.length === 0) {
    return <Txt variant="small">No winners yet — the first prize drawing is coming up.</Txt>
  }

  return (
    <FlatList
      horizontal
      data={drawings}
      keyExtractor={(d) => String(d.id)}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + GAP}
      decelerationRate="fast"
      style={styles.bleed}
      contentContainerStyle={styles.list}
      renderItem={({ item: d, index }) => {
        const payout = resolvePayout(d, getMint)
        const mint = d.mint ? getMint(d.mint) : undefined
        return (
          <Pressable
            onPress={() => onSelect?.(d)}
            disabled={!onSelect}
            accessibilityLabel={`Round ${d.round}, won ${formatPrizeUsd(d.amount_usd)}. View proof`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.top}>
              <View style={styles.badge}>
                <Txt style={styles.rank}>#{index + 1}</Txt>
              </View>
              <Txt style={styles.apr}>
                {d.winner_apr_percent !== null ? `${formatApr(d.winner_apr_percent)} APR` : '—'}
              </Txt>
            </View>
            <View style={styles.won}>
              <TokenIcon uri={payout.icon} size={18} />
              <Txt style={styles.usd} numberOfLines={1} adjustsFontSizeToFit>
                {formatPrizeUsd(d.amount_usd)}
              </Txt>
            </View>
            <View>
              <Txt style={styles.detail} numberOfLines={1}>
                {payout.text} {payout.symbol}
                {d.winner_stake !== null ? (
                  <Txt style={styles.staked}>
                    {' · '}
                    {formatTokenAmount(d.winner_stake, resolveMintDecimals(d.mint, mint))} staked
                  </Txt>
                ) : null}
              </Txt>
              <Txt style={styles.meta} numberOfLines={1}>
                {shortKey(d.winner_wallet)} · {formatDrawDate(d.revealed_at)}
              </Txt>
            </View>
          </Pressable>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: GAP, overflow: 'hidden' },
  skeleton: { borderRadius: radius.lg },
  bleed: { marginHorizontal: -space.lg },
  list: { gap: GAP, paddingHorizontal: space.lg },
  card: {
    backgroundColor: colors.card,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
    padding: space.md,
    width: CARD_WIDTH,
  },
  pressed: { opacity: 0.75 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  badge: {
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rank: { color: colors.accentSoft, fontSize: 10, fontWeight: '700' },
  apr: { color: colors.accent, fontSize: 11, fontVariant: ['tabular-nums'], fontWeight: '800' },
  won: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  usd: { color: colors.title, flexShrink: 1, fontSize: 20, fontVariant: ['tabular-nums'], fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 11 },
  meta: { color: colors.subtle, fontSize: 11, marginTop: 2 },
  staked: { color: colors.accent, fontSize: 11 },
})
