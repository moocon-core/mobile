import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { PublicKey } from '@solana/web3.js'
import { SWAP_OUTPUT_TOKENS } from 'ts-sdk/consts'
import type { VaultWithAddress } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet } from '@/components/ui/sheet'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useCloseSwapPreference, useSetSwapPreference } from '@/lib/queries/use-vault-actions'
import { useSwapPreference } from '@/lib/queries/use-vaults'
import { useWalletAddress } from '@/lib/wallet'

const RAYDIUM_LOGO = 'https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png'

/** Opt in to having this vault's prizes swapped into another token on the way out. */
export function SwapPreferencePanel({
  vault,
  tokenName,
  tokenIcon,
}: {
  vault: VaultWithAddress
  tokenName: string
  tokenIcon: string
}) {
  const owner = useWalletAddress()
  const { data: preference, isLoading } = useSwapPreference(vault, owner)
  const setPreference = useSetSwapPreference(vault)
  const closePreference = useCloseSwapPreference(vault)
  const [pickerOpen, setPickerOpen] = useState(false)
  // null until the user picks, so a preference that loads later still becomes the selection.
  const [picked, setPicked] = useState<string | null>(null)

  // The vault mint is never a swap output, so it stands for "no swap".
  const vaultMint = vault.mint.toBase58()
  const options = [
    { value: vaultMint, label: tokenName, sublabel: 'No swap', icon: tokenIcon },
    ...SWAP_OUTPUT_TOKENS.map((t) => ({ value: t.mint.toBase58(), label: t.symbol, sublabel: t.name, icon: t.icon })),
  ]
  const current = preference?.outputMint.toBase58() ?? vaultMint
  const selected = picked ?? current
  const selectedOption = options.find((o) => o.value === selected) ?? options[0]
  const currentLabel = options.find((o) => o.value === current)?.label ?? tokenName
  const isPending = setPreference.isPending || closePreference.isPending
  const isChange = selected !== current

  function submit() {
    const onSuccess = () => setPicked(null)
    if (selected === vaultMint) closePreference.mutate(undefined, { onSuccess })
    else setPreference.mutate(new PublicKey(selected), { onSuccess })
  }

  return (
    <Card style={styles.card}>
      <Txt variant="label">Payout</Txt>
      <Txt variant="small">
        {current === vaultMint
          ? `Prizes arrive in ${tokenName}. Pick a token to have them swapped automatically.`
          : `Prizes are swapped into ${currentLabel} before they reach your wallet.`}
      </Txt>

      <Pressable
        style={styles.select}
        onPress={() => setPickerOpen(true)}
        disabled={isPending || isLoading || !owner}
        accessibilityLabel="Choose payout token"
      >
        <TokenIcon uri={selectedOption.icon} size={24} />
        <View style={styles.selectText}>
          <Txt style={styles.optionLabel}>{selectedOption.label}</Txt>
          <Txt variant="small">{selectedOption.sublabel}</Txt>
        </View>
        <Feather name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      {owner && !isPending && !isChange ? (
        <View style={styles.saved}>
          <Feather name="check" size={14} color={colors.success} />
          <Txt style={styles.savedText}>Saved</Txt>
        </View>
      ) : (
        <Button
          label={!owner ? 'Connect wallet' : isPending ? 'Confirm in wallet…' : `Receive ${selectedOption.label}`}
          size="sm"
          loading={isPending}
          disabled={!owner || isLoading}
          onPress={submit}
        />
      )}

      {selected !== vaultMint ? (
        <View style={styles.raydium}>
          <Txt variant="small" style={styles.raydiumText}>
            Executed on Raydium
          </Txt>
          <Image source={{ uri: RAYDIUM_LOGO }} style={styles.raydiumLogo} />
        </View>
      ) : null}

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Receive prizes in">
        {options.map((o) => {
          const active = o.value === selected
          return (
            <Pressable
              key={o.value}
              style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}
              onPress={() => {
                setPicked(o.value)
                setPickerOpen(false)
              }}
            >
              <TokenIcon uri={o.icon} size={28} />
              <View style={styles.selectText}>
                <Txt style={styles.optionLabel}>{o.label}</Txt>
                <Txt variant="small">{o.sublabel}</Txt>
              </View>
              {active ? <Feather name="check" size={18} color={colors.accent} /> : null}
            </Pressable>
          )
        })}
      </Sheet>
    </Card>
  )
}

const styles = StyleSheet.create({
  saved: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center' },
  savedText: { color: colors.success, fontSize: 13, fontWeight: '600' },
  card: { gap: space.md },
  select: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
  },
  selectText: { flex: 1 },
  optionLabel: { fontWeight: '700' },
  raydium: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center' },
  raydiumText: { fontSize: 11 },
  raydiumLogo: { height: 12, width: 12 },
  option: { alignItems: 'center', borderRadius: radius.md, flexDirection: 'row', gap: space.md, padding: space.md },
  optionActive: { backgroundColor: colors.cardRaised },
  optionPressed: { opacity: 0.7 },
})
