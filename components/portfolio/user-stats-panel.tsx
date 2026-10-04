import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import type { PublicKey } from '@solana/web3.js'
import { formatApr, formatUsd, totalPositionsUsd, type VaultWithAddress } from '@moocon/shared'
import { UserRewardsSheet } from '@/components/portfolio/user-rewards-sheet'
import { StatTiles } from '@/components/stat-tiles'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useWalletWins } from '@/lib/queries/use-drawings'
import { useUserPositions, useUserRewards } from '@/lib/queries/use-vaults'

export function UserStatsPanel({ owner, vaults }: { owner: PublicKey; vaults: VaultWithAddress[] }) {
  const { data: wins } = useWalletWins(owner.toBase58())
  const { data: positions } = useUserPositions(vaults, owner)
  const { data: rewards = [] } = useUserRewards(owner)
  const [rewardsOpen, setRewardsOpen] = useState(false)
  const loading = wins === undefined || positions === undefined

  return (
    <View style={styles.root}>
      <StatTiles
        stats={[
          { label: 'Deposited', value: formatUsd(totalPositionsUsd(positions ?? [])), loading },
          { label: 'Won', value: formatUsd(wins?.total_usd_won ?? 0), loading },
          {
            label: 'APR',
            value: wins?.average_apr_percent == null ? '—' : formatApr(wins.average_apr_percent),
            accent: true,
            loading,
          },
        ]}
      />
      {rewards.length > 0 ? (
        <Pressable style={styles.rewards} onPress={() => setRewardsOpen(true)} accessibilityRole="button">
          <View style={styles.badge}>
            <Txt style={styles.badgeText}>{rewards.length}</Txt>
          </View>
          <Txt style={styles.rewardsText}>{rewards.length === 1 ? 'Reward to claim' : 'Rewards to claim'}</Txt>
          <Feather name="chevron-right" size={16} color={colors.accent} />
        </Pressable>
      ) : null}
      <UserRewardsSheet open={rewardsOpen} onClose={() => setRewardsOpen(false)} rewards={rewards} vaults={vaults} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  rewards: {
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 5,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  rewardsText: { color: colors.accent, flex: 1, fontSize: 13, fontWeight: '700' },
})
