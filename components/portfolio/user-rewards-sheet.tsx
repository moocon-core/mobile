import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import type { RewardCommitmentAccount } from 'ts-sdk/fetcher'
import { formatTokenAmount, pairRewardsWithVaults, resolveMintDecimals, type VaultWithAddress } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'
import { useClaimAllRewards, useClaimReward } from '@/lib/queries/use-vault-actions'

export function UserRewardsSheet({
  open,
  onClose,
  rewards,
  vaults,
}: {
  open: boolean
  onClose: () => void
  rewards: RewardCommitmentAccount[]
  vaults: VaultWithAddress[]
}) {
  const getMint = useMintStore((s) => s.getMint)
  const claimReward = useClaimReward()
  const claimAll = useClaimAllRewards()
  const [claimingRound, setClaimingRound] = useState<number | null>(null)
  const pairs = pairRewardsWithVaults(rewards, vaults)
  const busy = claimingRound !== null || claimAll.isPending

  return (
    <Sheet open={open} onClose={onClose} title="Your Rewards">
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {rewards.map((reward) => {
          const pair = pairs.find((p) => p.reward === reward)
          const meta = pair ? getMint(pair.vault.mint.toBase58()) : undefined
          const decimals = resolveMintDecimals(pair?.vault.mint.toBase58(), meta)
          return (
            <View key={`${reward.vault.toBase58()}-${reward.round}`} style={styles.row}>
              <TokenIcon uri={meta?.icon} size={28} />
              <View style={styles.flex}>
                <Txt variant="label">Round {reward.round}</Txt>
                <Txt style={styles.amount}>
                  {formatTokenAmount(Number(reward.amount) / 10 ** decimals, decimals)} {meta?.symbol}
                </Txt>
              </View>
              <Button
                label="Claim"
                variant="stake"
                style={styles.claim}
                loading={claimingRound === reward.round}
                disabled={busy || !pair}
                onPress={() => {
                  if (!pair) return
                  setClaimingRound(reward.round)
                  claimReward.mutate([pair], { onSettled: () => setClaimingRound(null) })
                }}
              />
            </View>
          )
        })}
      </ScrollView>
      {rewards.length >= 2 ? (
        <Button
          variant="stake"
          label={claimAll.isPending ? 'Confirm in wallet…' : `Claim all (${pairs.length})`}
          loading={claimAll.isPending}
          disabled={busy}
          onPress={() => claimAll.mutate(pairs)}
        />
      ) : null}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  list: { flexGrow: 0, maxHeight: 360 },
  listContent: { gap: space.sm },
  row: {
    alignItems: 'center',
    backgroundColor: colors.cardRaised,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
  flex: { flex: 1, gap: 2 },
  amount: { fontSize: 16, fontVariant: ['tabular-nums'], fontWeight: '700' },
  claim: { minHeight: 38 },
})
