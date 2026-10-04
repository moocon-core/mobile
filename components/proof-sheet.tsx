import { useState, type ReactNode } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Feather from '@expo/vector-icons/Feather'
import * as Haptics from 'expo-haptics'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import {
  ellipsify,
  formatCount,
  formatRevealDate,
  formatTokenAmount,
  magicblockErUrl,
  proofDataRows,
  proofTxRows,
  resolveMintDecimals,
  resolvePayout,
  solscanUrl,
  type Drawing,
} from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { StatTiles } from '@/components/stat-tiles'
import { Sheet } from '@/components/ui/sheet'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { API_BASE_URL } from '@/lib/api'
import { useMintStore } from '@/lib/mint-store'

function open(url: string) {
  Linking.openURL(url).catch(() => {})
}

function IconButton({
  name,
  onPress,
  label,
}: {
  name: 'copy' | 'check' | 'external-link'
  onPress: () => void
  label: string
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={label} style={styles.iconBtn}>
      <Feather name={name} size={15} color={name === 'external-link' ? colors.accent : colors.muted} />
    </Pressable>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <IconButton
      name={copied ? 'check' : 'copy'}
      label="Copy"
      onPress={() => {
        Clipboard.setString(value)
        Haptics.selectionAsync().catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    />
  )
}

function DataRow({
  label,
  value,
  href,
  icon,
  full,
}: {
  label: string
  value: string | null
  href?: string
  icon?: ReactNode
  full?: boolean
}) {
  return (
    <View style={[styles.row, full && styles.rowFull]}>
      <Txt style={styles.rowLabel}>{label}</Txt>
      {value ? (
        <View style={styles.rowValue}>
          {icon}
          <Txt style={styles.mono} numberOfLines={full ? undefined : 1} selectable>
            {full ? value : ellipsify(value, 6, '…')}
          </Txt>
          <CopyButton value={value} />
          {href ? (
            <IconButton name="external-link" label={`Open ${label} on Solscan`} onPress={() => open(href)} />
          ) : null}
        </View>
      ) : (
        <Txt variant="small">—</Txt>
      )}
    </View>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt style={styles.sectionTitle}>{title}</Txt>
      {children}
    </View>
  )
}

/** Raw hashes are for auditors; keep them folded so the sheet reads as a receipt first. */
function ProofData({ rows }: { rows: { label: string; value: string | null }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.toggle}
      >
        <Txt style={styles.toggleText}>{open ? 'Hide proof data' : 'Show proof data'}</Txt>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.accent} />
      </Pressable>
      {open ? rows.map(({ label, value }) => <DataRow key={label} label={label} value={value} full />) : null}
    </View>
  )
}

export function ProofSheet({ drawing, onClose }: { drawing: Drawing | null; onClose: () => void }) {
  const { connection } = useMobileWallet()
  const { height } = useWindowDimensions()
  const isDevnet = connection.rpcEndpoint.includes('devnet')
  const getMint = useMintStore((s) => s.getMint)
  const metadata = drawing?.mint ? getMint(drawing.mint) : undefined
  const decimals = resolveMintDecimals(drawing?.mint, metadata)
  const tokenAmount = drawing?.amount != null ? formatTokenAmount(drawing.amount / 10 ** decimals, decimals) : '—'
  // A swapped prize headlines what the winner received; the vault-token yield stays underneath.
  const payout = drawing?.payout?.swapped ? resolvePayout(drawing, getMint) : null
  const account = (a: string) => solscanUrl(`/account/${a}`, isDevnet)

  return (
    <Sheet
      open={drawing !== null}
      onClose={onClose}
      lazy={{ placeholderHeight: height * 0.9 - 130 }}
      title={drawing ? `Drawing Proof · Round #${drawing.round}` : ''}
    >
      {drawing ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
          <View style={styles.winner}>
            <View style={styles.winnerHead}>
              <TokenIcon uri={payout?.icon ?? metadata?.icon} size={36} />
              <View>
                <Txt style={styles.rowLabel}>{payout ? 'Paid out' : 'Yield'}</Txt>
                <Txt style={styles.amount}>
                  {payout?.text ?? tokenAmount} <Txt variant="small">{payout?.symbol ?? metadata?.symbol ?? ''}</Txt>
                </Txt>
                {payout ? (
                  <Txt variant="small">
                    Swapped from {tokenAmount} {metadata?.symbol ?? ''}
                  </Txt>
                ) : null}
              </View>
            </View>
            <StatTiles
              stats={[
                { label: 'Tickets', value: formatCount(Number(drawing.total_tickets)) },
                {
                  label: 'Winner index',
                  value: drawing.winner_index != null ? String(Number(drawing.winner_index)) : '—',
                },
              ]}
            />
            <DataRow
              label="Winner"
              value={drawing.winner_wallet}
              href={drawing.winner_wallet ? account(drawing.winner_wallet) : undefined}
            />
          </View>

          <Section title="Vault">
            <DataRow label="Vault" value={drawing.vault} href={account(drawing.vault)} />
            <DataRow
              label="Mint"
              value={drawing.mint}
              href={drawing.mint ? account(drawing.mint) : undefined}
              icon={<TokenIcon uri={metadata?.icon} size={16} />}
            />
            {payout && drawing.payout?.mint ? (
              <DataRow
                label="Payout mint"
                value={drawing.payout.mint}
                href={account(drawing.payout.mint)}
                icon={<TokenIcon uri={payout.icon} size={16} />}
              />
            ) : null}
          </Section>

          <Section title="Transactions">
            {proofTxRows(drawing).map(({ label, tx, er }) => (
              <DataRow
                key={label}
                label={label}
                value={tx}
                href={tx ? solscanUrl(`/tx/${tx}`, isDevnet, er ? magicblockErUrl(isDevnet) : undefined) : undefined}
              />
            ))}
          </Section>

          <ProofData rows={proofDataRows(drawing)} />

          <View style={styles.footer}>
            <Txt style={styles.rowLabel}>Revealed</Txt>
            <Txt variant="small">{formatRevealDate(drawing.revealed_at)}</Txt>
          </View>
          <Button label="View snapshot" size="sm" onPress={() => open(`${API_BASE_URL}/api/proofs/${drawing.id}`)} />
        </ScrollView>
      ) : null}
    </Sheet>
  )
}

// Matches the stat tiles.
const BORDER = 'rgba(148, 163, 184, 0.12)'

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  body: { gap: space.md, paddingBottom: space.sm },
  winner: {
    backgroundColor: colors.card,
    borderColor: BORDER,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space.md,
    padding: space.md,
  },
  winnerHead: { alignItems: 'center', flexDirection: 'row', gap: space.md },
  amount: { color: colors.title, fontSize: 22, fontVariant: ['tabular-nums'], fontWeight: '800', marginTop: 2 },
  section: {
    backgroundColor: colors.card,
    borderColor: BORDER,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
  },
  sectionTitle: { color: colors.title, fontSize: 13, fontWeight: '700', paddingTop: space.md },
  toggle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.md },
  toggleText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  row: {
    alignItems: 'center',
    borderTopColor: colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'space-between',
    paddingVertical: space.sm + 2,
  },
  rowFull: { alignItems: 'flex-start', flexDirection: 'column' },
  rowLabel: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  rowValue: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 4 },
  mono: { color: colors.foreground, flexShrink: 1, fontFamily: 'SpaceMono', fontSize: 11 },
  iconBtn: { padding: 4 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.xs },
})
