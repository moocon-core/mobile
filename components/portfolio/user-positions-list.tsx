import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import type { PublicKey } from '@solana/web3.js'
import { formatPositionAmount, formatUsd, type VaultWithAddress } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'
import { useDrawings } from '@/lib/queries/use-drawings'
import { useUserPositions } from '@/lib/queries/use-vaults'

export function UserPositionsList({ owner, vaults }: { owner: PublicKey; vaults: VaultWithAddress[] }) {
  const { data: positions, isLoading } = useUserPositions(vaults, owner)
  const { data: drawings } = useDrawings(1, 100)
  const getMint = useMintStore((s) => s.getMint)
  const aprByVault = drawings?.winners_compound_average_apy_percent_by_vault ?? {}
  const held = (positions ?? []).filter((p) => p.amount > 0)
  const pending = isLoading || positions === undefined

  if (!pending && held.length === 0) {
    return (
      <Card style={styles.empty}>
        <Txt variant="small" style={styles.center}>
          You don&apos;t have any positions yet. Deposit into a vault to start earning.
        </Txt>
        <Button label="Browse vaults" size="sm" onPress={() => router.navigate('/')} />
      </Card>
    )
  }

  return (
    <Card style={styles.card}>
      {pending && held.length === 0
        ? [0, 1].map((k) => <Skeleton key={k} height={48} style={styles.skeleton} />)
        : held.map(({ vault, amount, usd, decimals }, i) => {
            const address = vault.address.toBase58()
            const meta = getMint(vault.mint.toBase58())
            const apr = aprByVault[address] ?? null
            return (
              <Pressable
                key={address}
                onPress={() => router.push(`/vault/${address}`)}
                style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && styles.pressed]}
                accessibilityLabel={`Manage ${meta?.symbol ?? 'vault'} position`}
              >
                <TokenIcon uri={meta?.icon} size={32} />
                <View style={styles.flex}>
                  <Txt style={styles.symbol}>{meta?.symbol ?? 'Unknown'}</Txt>
                  <Txt variant="small">
                    {formatPositionAmount(amount, decimals)} · APR{' '}
                    <Txt style={styles.apr}>{apr != null ? `${apr.toFixed(2)}%` : '—'}</Txt>
                  </Txt>
                </View>
                <Txt style={styles.value}>{usd != null ? formatUsd(usd) : '—'}</Txt>
                <Feather name="chevron-right" size={18} color={colors.subtle} />
              </Pressable>
            )
          })}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { paddingVertical: space.xs },
  empty: { alignItems: 'stretch', gap: space.lg, paddingVertical: space.xl },
  center: { textAlign: 'center' },
  skeleton: { marginVertical: space.sm },
  row: { alignItems: 'center', flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  divider: { borderTopColor: colors.hairline, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { opacity: 0.6 },
  flex: { flex: 1, gap: 2 },
  symbol: { fontSize: 16, fontWeight: '700' },
  apr: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  value: { fontSize: 16, fontVariant: ['tabular-nums'], fontWeight: '700' },
})
