import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { activeTierIndexes, formatUsdCompact, suppliedDisplay, type VaultWithAddress } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { TierTile } from '@/components/vault/tier-row'
import { colors, space } from '@/constants/theme'
import { apiQueries } from '@/lib/api'
import { useVaultView } from '@/lib/hooks/use-vault-view'

export function VaultCard({
  vault,
  avgApr,
  latestPayoutRawByTier,
}: {
  vault: VaultWithAddress
  avgApr: number | null
  latestPayoutRawByTier: Record<string, string>
}) {
  const view = useVaultView(vault)
  const queryClient = useQueryClient()
  const vaultKey = vault.address.toBase58()
  const open = () => router.push(`/vault/${vaultKey}`)
  // Start the detail page's slowest queries on touch-down so they overlap the push animation.
  const prefetch = () => {
    queryClient.prefetchQuery(apiQueries.vaultAprHistory(vaultKey)).catch(() => {})
    queryClient.prefetchQuery(apiQueries.drawingsByVault(vaultKey, 1, 100)).catch(() => {})
  }
  const tierIndexes = activeTierIndexes(vault.distributionTiers)
  const supplied = suppliedDisplay(view, view.name)
  // Compact USD fits the one-line header; the full figure is on the vault page.
  const suppliedText = view.tvlUsd != null ? formatUsdCompact(view.tvlUsd, view.tvlUsd < 1000) : supplied?.value

  return (
    <Pressable
      onPressIn={prefetch}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Open ${view.name} vault`}
    >
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.pressed]}>
          <View style={styles.header}>
            <TokenIcon uri={view.icon} size={36} />
            <View style={styles.headerText}>
              <Txt style={styles.name}>{view.name}</Txt>
              {supplied == null ? (
                <Skeleton width={130} height={12} />
              ) : (
                <Txt variant="small" numberOfLines={1}>
                  <Txt style={styles.metaValue}>{suppliedText}</Txt> supplied ·{' '}
                  <Txt style={styles.apr}>{avgApr !== null ? `${avgApr.toFixed(2)}%` : '—'}</Txt> APR
                </Txt>
              )}
            </View>
            <Button label="Deposit" size="sm" onPress={open} />
          </View>

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
                  latestPayoutRaw={latestPayoutRawByTier[String(i)]}
                />
              ))}
            </View>
          )}
        </Card>
      )}
    </Pressable>
  )
}

export function VaultCardSkeleton() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Skeleton round height={36} />
        <View style={styles.headerText}>
          <Skeleton width={70} height={15} />
          <Skeleton width={150} height={12} />
        </View>
      </View>
      <View style={styles.tiers}>
        <Skeleton height={72} style={styles.flex} />
        <Skeleton height={72} style={styles.flex} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { gap: space.md, padding: space.md + 2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  header: { alignItems: 'center', flexDirection: 'row', gap: space.md },
  headerText: { flex: 1, gap: 4 },
  name: { color: colors.title, fontSize: 16, fontWeight: '800' },
  metaValue: { color: colors.foreground, fontSize: 13, fontWeight: '700' },
  apr: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  tiers: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
})
