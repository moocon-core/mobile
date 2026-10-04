import { useRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { NATIVE_MINT } from '@solana/spl-token'
import {
  canSubmitVaultForm,
  depositableBalance,
  formatRawAmount,
  formatTokenBalance,
  isValidAmountInput,
  normalizeDecimals,
  parseRawAmount,
  rawToDisplay,
  toSafeNumber,
  trimDecimals,
  vaultFormError,
  type VaultFormTab,
  type VaultWithAddress,
} from '@moocon/shared'
import { WalletButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Sheet } from '@/components/ui/sheet'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useVaultCountdown } from '@/lib/hooks/use-vault-countdown'
import { useDeposit, useRedeem } from '@/lib/queries/use-vault-actions'
import { useNativeSolBalance, useUserPTokenBalance, useUserTokenBalance } from '@/lib/queries/use-vaults'
import { useWalletAddress } from '@/lib/wallet'

const TABS = [
  { label: 'Deposit', value: 'deposit' },
  { label: 'Withdraw', value: 'withdraw' },
] as const

export function DepositWithdrawSheet({
  vault,
  metadata,
  avgApr,
  tab,
  onTabChange,
  open,
  onClose,
}: {
  vault: VaultWithAddress
  metadata: { name: string; icon: string; decimals: number }
  avgApr: number | null
  tab: VaultFormTab
  onTabChange: (tab: VaultFormTab) => void
  open: boolean
  onClose: () => void
}) {
  const owner = useWalletAddress()
  const connected = owner !== null
  const [input, setInput] = useState('')
  const inputRef = useRef<TextInput>(null)
  // Android fires onShow before the slide-in finishes; focusing then is silently dropped.
  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 300)
  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false)

  const isSol = vault.mint.equals(NATIVE_MINT)
  const { data: userTokenRaw = 0n } = useUserTokenBalance(vault.mint, owner)
  const { data: nativeSolRaw = 0n } = useNativeSolBalance(isSol ? owner : null)
  const { data: pTokenBalanceRaw = 0 } = useUserPTokenBalance(vault, owner, metadata.decimals)
  const deposit = useDeposit(vault)
  const redeem = useRedeem(vault)

  const decimals = normalizeDecimals(metadata.decimals)
  const isPending = deposit.isPending || redeem.isPending
  const { raw: depositableRaw, solShortfall } = depositableBalance(isSol, nativeSolRaw, userTokenRaw)
  const depositable = toSafeNumber(rawToDisplay(depositableRaw, decimals))
  const deposited = toSafeNumber(pTokenBalanceRaw)
  const form = {
    tab,
    connected,
    amount: parseFloat(input) || 0,
    isMaxWithdraw,
    solShortfall,
    depositable,
    deposited,
    minDeposit: toSafeNumber(Number(vault.minDeposit) / 10 ** decimals),
    decimals,
    symbol: metadata.name,
  }
  const error = vaultFormError(form)
  const canSubmit = canSubmitVaultForm(form, isPending)

  function reset() {
    setInput('')
    setIsMaxWithdraw(false)
  }

  function fill(fraction: 1 | 0.5) {
    if (tab === 'deposit') {
      // From raw units: rounding the float display up would ask to spend more than the wallet holds.
      setInput(formatRawAmount(fraction === 1 ? depositableRaw : depositableRaw / 2n, decimals))
      return
    }
    // A full withdraw is its own on-chain path; rounding the display back to raw would leave dust.
    setIsMaxWithdraw(fraction === 1)
    setInput(trimDecimals(deposited * fraction, decimals))
  }

  function submit() {
    if (!canSubmit) return
    const raw = parseRawAmount(input, decimals)
    const onSuccess = () => {
      reset()
      onClose()
    }
    if (tab === 'deposit') deposit.mutate(raw, { onSuccess })
    else redeem.mutate({ amount: raw, isMax: isMaxWithdraw }, { onSuccess })
  }

  return (
    <Sheet open={open} onClose={onClose} onShow={focusInput}>
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={(t) => {
          reset()
          onTabChange(t)
        }}
      />

      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <View style={styles.token}>
            <TokenIcon uri={metadata.icon} size={22} />
            <Txt style={styles.tokenName}>{metadata.name}</Txt>
          </View>
          <Txt variant="small">
            {tab === 'deposit' ? 'Balance' : 'Deposited'}{' '}
            {formatTokenBalance(tab === 'deposit' ? depositable : deposited, decimals)}
          </Txt>
        </View>
        <TextInput
          value={input}
          onChangeText={(v) => {
            const normalized = v.replace(',', '.')
            if (isValidAmountInput(normalized, decimals)) {
              setIsMaxWithdraw(false)
              setInput(normalized)
            }
          }}
          placeholder="0.00"
          placeholderTextColor={colors.subtle}
          keyboardType="decimal-pad"
          ref={inputRef}
          style={styles.input}
          accessibilityLabel="Amount"
        />
        <View style={styles.quick}>
          {([0.5, 1] as const).map((f) => (
            <Pressable key={f} onPress={() => fill(f)} style={styles.chip} disabled={!connected}>
              <Txt style={styles.chipText}>{f === 1 ? 'MAX' : '50%'}</Txt>
            </Pressable>
          ))}
          <Txt variant="small" style={[styles.error, !error && styles.hidden]}>
            {error || ' '}
          </Txt>
        </View>
      </View>

      <DrawInfo vault={vault} avgApr={avgApr} />

      {connected ? (
        <Button
          label={isPending ? 'Confirm in wallet…' : tab === 'deposit' ? 'Deposit' : 'Withdraw'}
          loading={isPending}
          disabled={!canSubmit}
          onPress={submit}
        />
      ) : (
        <View style={styles.connect}>
          <WalletButton />
        </View>
      )}
    </Sheet>
  )
}

/** What the deposit is entering: the next draw and the vault's running APR. */
function DrawInfo({ vault, avgApr }: { vault: VaultWithAddress; avgApr: number | null }) {
  const countdown = useVaultCountdown(vault.distributionTiers)
  return (
    <View style={styles.info}>
      <View style={styles.infoItem}>
        <Txt style={styles.infoLabel}>Next draw</Txt>
        <Txt style={[styles.infoValue, styles.mono]}>{countdown}</Txt>
      </View>
      <View style={styles.infoItem}>
        <Txt style={styles.infoLabel}>Avg APR</Txt>
        <Txt style={[styles.infoValue, styles.apr]}>{avgApr != null ? `${avgApr.toFixed(2)}%` : '—'}</Txt>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.xs },
  infoItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  infoLabel: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  infoValue: { color: colors.foreground, fontSize: 12 },
  mono: { fontFamily: 'SpaceMono' },
  apr: { color: colors.accent, fontWeight: '700' },
  field: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.hairline,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space.sm,
    padding: space.lg,
  },
  fieldHead: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  token: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  tokenName: { fontWeight: '700' },
  input: {
    color: colors.title,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    paddingVertical: space.xs,
  },
  quick: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  chip: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  error: { color: colors.error, flex: 1, textAlign: 'right' },
  hidden: { opacity: 0 },
  connect: { alignItems: 'center' },
})
