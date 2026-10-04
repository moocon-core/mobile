import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  activeTierIndexes,
  formatUsd,
  latestVaultStat,
  suppliedDisplay,
  type Drawing,
  type VaultFormTab,
  type VaultWithAddress,
} from '@moocon/shared'
import { BackHeader } from '@/components/back-header'
import { ProofSheet } from '@/components/proof-sheet'
import { Screen } from '@/components/screen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenIcon } from '@/components/ui/token-icon'
import { SectionHeading, Txt } from '@/components/ui/txt'
import { DepositWithdrawSheet } from '@/components/vault/deposit-withdraw-sheet'
import { StatTiles } from '@/components/stat-tiles'
import { SwapPreferencePanel } from '@/components/vault/swap-preference-panel'
import { TierTile } from '@/components/vault/tier-row'
import { VaultDrawsList } from '@/components/vault/vault-draws-list'
import { VaultHistoryChart } from '@/components/vault/vault-history-chart'
import { colors, radius, space } from '@/constants/theme'
import { useAfterTransition } from '@/lib/hooks/use-after-transition'
import { useVaultView } from '@/lib/hooks/use-vault-view'
import { useDrawings, useDrawingsByVault, useVaultAprHistory } from '@/lib/queries/use-drawings'
import { useStats } from '@/lib/queries/use-stats'
import { useAllVaults } from '@/lib/queries/use-vaults'

const DRAWS_SHOWN = 10
// Both list views rank one fetch, so it covers the vault's history (100 is the API max).
const DRAWS_FETCH_LIMIT = 100

export default function VaultScreen() {
  const { address } = useLocalSearchParams<{ address: string }>()
  const { data: vaults, isLoading } = useAllVaults()
  const vault = vaults?.find((v) => v.address.toBase58() === address)

  if (isLoading && !vault) {
    return (
      <Screen header={<BackHeader />}>
        <Skeleton width={160} height={28} />
        <View style={styles.skeletonRow}>
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} width={140} height={86} />
          ))}
        </View>
        <Skeleton height={320} style={styles.gap} />
      </Screen>
    )
  }

  if (!vault) {
    return (
      <Screen header={<BackHeader />}>
        <SectionHeading eyebrow="Vault" title="Not found" />
        <Txt variant="small" style={styles.gap}>
          No vault matches <Txt style={styles.mono}>{address}</Txt>.
        </Txt>
        <Button label="Back to vaults" onPress={() => router.replace('/')} style={styles.gap} />
      </Screen>
    )
  }

  return <VaultContent vault={vault} />
}

function VaultContent({ vault }: { vault: VaultWithAddress }) {
  const queryClient = useQueryClient()
  const insets = useSafeAreaInsets()
  const vaultKey = vault.address.toBase58()
  const [sheetTab, setSheetTab] = useState<VaultFormTab | null>(null)
  const [proof, setProof] = useState<Drawing | null>(null)
  const ready = useAfterTransition()

  const { data: vaultDrawings, isLoading: drawingsLoading } = useDrawingsByVault(vaultKey, 1, DRAWS_FETCH_LIMIT)
  const { data: vaultHistory, isLoading: historyLoading } = useVaultAprHistory(vaultKey)
  const { data: allDrawings } = useDrawings(1, 100)
  const { data: stats } = useStats({ interval: '1h', limit: 1, vault: vaultKey })
  const view = useVaultView(vault)

  const avgApr = vaultHistory?.average_apr_percent ?? null
  const latestPayouts = allDrawings?.latest_payout_raw_by_vault_and_tier?.[vaultKey] ?? {}
  const latestStat = latestVaultStat(stats?.data, vaultKey)
  const supplied = suppliedDisplay(view, view.name)
  const tierIndexes = activeTierIndexes(vault.distributionTiers)
  const metadata = { name: view.name, icon: view.icon, decimals: view.decimals }

  return (
    <>
      <Screen
        header={
          <BackHeader>
            <TokenIcon uri={view.icon} size={32} />
            <Txt variant="h2">{view.name}</Txt>
          </BackHeader>
        }
        onRefresh={() =>
          Promise.all([
            queryClient.invalidateQueries({ queryKey: ['vaults'] }),
            queryClient.invalidateQueries({ queryKey: ['drawings'] }),
            queryClient.invalidateQueries({ queryKey: ['stats'] }),
            queryClient.invalidateQueries({ queryKey: ['user'] }),
          ])
        }
        footer={
          <View style={[styles.actionBar, { paddingBottom: insets.bottom + space.sm }]}>
            <Button label="Deposit" size="sm" style={styles.action} onPress={() => setSheetTab('deposit')} />
            <Button label="Withdraw" size="sm" style={styles.action} onPress={() => setSheetTab('withdraw')} />
          </View>
        }
      >
        <StatTiles
          stats={[
            { label: 'Avg APR', value: avgApr != null ? `${avgApr.toFixed(2)}%` : '—', accent: true },
            {
              label: 'Supplied',

              value: supplied?.value ?? '—',
              sub: supplied?.sub,
              loading: supplied === null,
            },
            {
              label: 'Distributed',

              value: latestStat ? formatUsd(latestStat.total_rewards_usd) : '—',
            },
          ]}
        />

        <View style={styles.section}>
          <Txt style={styles.subLabel}>Prize tiers</Txt>
          {tierIndexes.length === 0 ? (
            <Txt variant="small">No active prize tiers.</Txt>
          ) : (
            <View style={styles.tiers}>
              {tierIndexes.map((i) => (
                <TierTile
                  key={i}
                  vault={vault}
                  tierIndex={i}
                  icon={view.icon}
                  tokenDecimals={view.decimals}
                  latestPayoutRaw={latestPayouts[String(i)]}
                />
              ))}
            </View>
          )}
        </View>

        <Card style={[styles.section, styles.chartCard]}>
          {ready ? (
            <VaultHistoryChart
              vaultAddress={vaultKey}
              tokenName={view.name}
              tokenDecimals={view.decimals}
              history={vaultHistory?.series ?? []}
              historyLoading={historyLoading}
            />
          ) : (
            <Skeleton height={200} />
          )}
        </Card>

        <View style={styles.section}>
          <SwapPreferencePanel vault={vault} tokenName={view.name} tokenIcon={view.icon} />
        </View>

        <Divider />

        <SectionHeading eyebrow="History" title="Recent Draws" level="h2" />
        <View style={styles.section}>
          {ready ? (
            <VaultDrawsList
              drawings={vaultDrawings?.drawings ?? []}
              tierIntervals={vault.distributionTiers.map((t) => t.interval)}
              isLoading={drawingsLoading}
              limit={DRAWS_SHOWN}
              onSelect={setProof}
            />
          ) : (
            <Skeleton height={320} />
          )}
        </View>
      </Screen>

      <DepositWithdrawSheet
        vault={vault}
        metadata={metadata}
        avgApr={avgApr}
        tab={sheetTab ?? 'deposit'}
        onTabChange={setSheetTab}
        open={sheetTab !== null}
        onClose={() => setSheetTab(null)}
      />
      <ProofSheet drawing={proof} onClose={() => setProof(null)} />
    </>
  )
}

const styles = StyleSheet.create({
  skeletonRow: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  gap: { marginTop: space.lg },
  mono: { fontFamily: 'SpaceMono', fontSize: 12 },
  section: { gap: space.md, marginTop: space.lg },
  subLabel: { color: colors.muted, fontSize: 11, fontWeight: '500', marginBottom: -space.xs },
  tiers: { flexDirection: 'row', gap: space.sm },
  // Matches the stat tiles above.
  chartCard: { borderColor: 'rgba(148, 163, 184, 0.12)', borderRadius: radius.lg, padding: space.md },
  actionBar: {
    backgroundColor: 'rgba(11, 17, 32, 0.96)',
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  action: { flex: 1 },
})
