import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { getTierPrize, lastCommitAt, parseRawOrZero, tierLabel, type VaultWithAddress } from '@moocon/shared'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useVaultCountdown } from '@/lib/hooks/use-vault-countdown'

/** A tier as a compact tile; callers lay them out two to a row. */
export function TierTile({
  vault,
  tierIndex,
  icon,
  tokenDecimals,
  latestPayoutRaw,
}: {
  vault: VaultWithAddress
  tierIndex: number
  icon: string
  tokenDecimals: number
  latestPayoutRaw: string | undefined
}) {
  const tier = vault.distributionTiers[tierIndex]
  const countdown = useVaultCountdown(useMemo(() => [tier], [tier]))
  // Anchored to the last commit, so the per-second countdown re-render leaves the estimate untouched.
  const prize = getTierPrize(
    tier,
    tokenDecimals,
    parseRawOrZero(latestPayoutRaw),
    lastCommitAt(vault.distributionTiers),
  )
  return (
    <View style={styles.tile}>
      <Txt variant="label" numberOfLines={1} style={styles.tileLabel}>
        {tierLabel(tier.interval)}
      </Txt>
      <View style={styles.prize}>
        <TokenIcon uri={icon} size={14} />
        <Txt style={styles.prizeText} numberOfLines={1} adjustsFontSizeToFit>
          {prize}
        </Txt>
      </View>
      <Txt style={styles.countdown} numberOfLines={1}>
        {countdown || '—'}
      </Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderColor: colors.hairline,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: space.md - 2,
    paddingVertical: space.sm + 2,
  },
  tileLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2, textTransform: 'none' },
  prize: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  prizeText: { flexShrink: 1, fontSize: 15, fontVariant: ['tabular-nums'], fontWeight: '700' },
  countdown: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 11 },
})
