import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { formatDrawDate, resolvePayout, shortKey, type Drawing } from '@moocon/shared'
import { PayoutAmount } from '@/components/payout-amount'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'

/** One settled draw: caller-supplied title, winner and date, payout and APR; tapping opens its proof. */
export function DrawRow({
  drawing: d,
  title,
  divider,
  onPress,
  showWinner = true,
}: {
  drawing: Drawing
  title: ReactNode
  divider: boolean
  onPress: () => void
  /** Off on your own wins, where every row would repeat your address. */
  showWinner?: boolean
}) {
  const getMint = useMintStore((s) => s.getMint)
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
      accessibilityLabel={`Round ${d.round} proof`}
    >
      <View style={styles.left}>
        <View style={styles.titleRow}>{title}</View>
        <Txt variant="small" style={styles.meta}>
          {showWinner ? `${shortKey(d.winner_wallet)} · ` : ''}
          {formatDrawDate(d.revealed_at)}
        </Txt>
      </View>
      <View style={styles.right}>
        <PayoutAmount payout={resolvePayout(d, getMint)} size={16} textStyle={styles.payout} />
        <Txt style={styles.apr}>{d.winner_apr_percent !== null ? `${d.winner_apr_percent.toFixed(2)}%` : '—'}</Txt>
      </View>
      <Feather name="chevron-right" size={18} color={colors.subtle} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  divider: { borderTopColor: colors.hairline, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { opacity: 0.6 },
  left: { flex: 1, gap: 4 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  meta: { fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 2 },
  payout: { fontSize: 14, fontVariant: ['tabular-nums'], fontWeight: '600' },
  apr: { color: colors.accent, fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '700' },
})
