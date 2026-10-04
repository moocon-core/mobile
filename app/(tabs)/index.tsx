import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@/components/app-header'
import { ProofSheet } from '@/components/proof-sheet'
import { Screen } from '@/components/screen'
import { Card } from '@/components/ui/card'
import { SectionHeading, Txt } from '@/components/ui/txt'
import { BigWinnersCarousel } from '@/components/vaults/big-winners-carousel'
import { VaultCard, VaultCardSkeleton } from '@/components/vaults/vault-card'
import { VaultTicker } from '@/components/vaults/vault-ticker'
import { colors, space } from '@/constants/theme'
import { useMintData, useMintStore } from '@/lib/mint-store'
import { useDrawings } from '@/lib/queries/use-drawings'
import { useAllVaults } from '@/lib/queries/use-vaults'
import { useVaultSubscriptions } from '@/lib/queries/use-vault-subscriptions'
import type { Drawing } from '@moocon/shared'

export default function VaultsScreen() {
  const queryClient = useQueryClient()
  const { data: vaults = [], isLoading, isError } = useAllVaults()
  const { data: drawings } = useDrawings(1, 100)
  const getMint = useMintStore((s) => s.getMint)
  const [proof, setProof] = useState<Drawing | null>(null)
  const mints = useMintData()
  useVaultSubscriptions(vaults)

  const aprByVault = drawings?.winners_compound_average_apy_percent_by_vault ?? {}
  const payoutsByVault = drawings?.latest_payout_raw_by_vault_and_tier ?? {}
  const registered = vaults.filter((v) => getMint(v.mint.toBase58()))
  const failed = isError || mints.isError

  return (
    <Screen
      header={
        <>
          <AppHeader />
          <VaultTicker vaults={vaults} />
        </>
      }
      onRefresh={() =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['vaults'] }),
          queryClient.invalidateQueries({ queryKey: ['drawings'] }),
          queryClient.invalidateQueries({ queryKey: ['mintData'] }),
        ])
      }
    >
      <View style={styles.hofHead}>
        <Txt variant="eyebrow">Hall of Fame</Txt>
        <Pressable onPress={() => router.navigate('/analytics')} hitSlop={8} accessibilityRole="link">
          <Txt style={styles.seeAll}>See all ›</Txt>
        </Pressable>
      </View>
      <View style={styles.winners}>
        <BigWinnersCarousel onSelect={setProof} />
      </View>

      <SectionHeading eyebrow="Yield Vaults" title="Earn" level="h2" />
      <View style={styles.vaults}>
        {failed ? (
          <Card>
            <Txt variant="small">Couldn&apos;t load the vaults. Pull down to try again.</Txt>
          </Card>
        ) : null}
        {!failed && (isLoading || mints.isPending) && registered.length === 0
          ? [0, 1].map((k) => <VaultCardSkeleton key={k} />)
          : registered.map((vault) => (
              <VaultCard
                key={vault.mint.toBase58()}
                vault={vault}
                avgApr={aprByVault[vault.address.toBase58()] ?? null}
                latestPayoutRawByTier={payoutsByVault[vault.address.toBase58()] ?? {}}
              />
            ))}
      </View>
      <ProofSheet drawing={proof} onClose={() => setProof(null)} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  hofHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  seeAll: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  winners: { marginBottom: space.xl, marginTop: space.sm },
  vaults: { gap: space.md, marginTop: space.md },
})
