import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Feather from '@expo/vector-icons/Feather'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { ellipsify } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { SpinSurface } from '@/components/ui/spin-surface'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { openSolscan, toastError, toastInfo, toastSuccess } from '@/lib/toast'
import { walletErrorKind } from '@/lib/wallet-errors'
import { formatError } from '@/utils/format-error'
import { IS_PREVIEW_WALLET, useConnectWallet, useWalletAddress } from '@/lib/wallet'

export function WalletButton() {
  const { disconnect, connection } = useMobileWallet()
  const connect = useConnectWallet()
  const owner = useWalletAddress()
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)

  async function handleConnect() {
    setConnecting(true)
    try {
      await connect()
    } catch (e) {
      if (walletErrorKind(e) === 'cancelled') toastInfo('Connection cancelled')
      else toastError(`Could not connect wallet: ${formatError(e)}`)
    } finally {
      setConnecting(false)
    }
  }

  if (!owner) {
    return (
      <Button label={connecting ? 'Connecting…' : 'Connect'} size="sm" loading={connecting} onPress={handleConnect} />
    )
  }

  const address = owner.toBase58()
  const actions = [
    {
      icon: 'copy' as const,
      label: 'Copy address',
      onPress: () => {
        Clipboard.setString(address)
        toastSuccess('Address copied')
      },
    },
    {
      icon: 'external-link' as const,
      label: 'View on Solscan',
      onPress: () => openSolscan(`/account/${address}`, connection.rpcEndpoint),
    },
  ]

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityLabel="Wallet menu">
        {({ pressed }) => (
          <SpinSurface style={[styles.pill, pressed && styles.pressed]}>
            <View style={[styles.dot, IS_PREVIEW_WALLET && styles.previewDot]} />
            <Text style={styles.pillText}>{ellipsify(address)}</Text>
          </SpinSurface>
        )}
      </Pressable>
      <Sheet open={open} onClose={() => setOpen(false)} title="Wallet">
        <View style={styles.addressBox}>
          <View style={[styles.dot, IS_PREVIEW_WALLET && styles.previewDot]} />
          <Txt style={styles.address} selectable numberOfLines={1}>
            {ellipsify(address, 8, '…')}
          </Txt>
        </View>
        {IS_PREVIEW_WALLET ? (
          <Txt variant="small" style={styles.previewNote}>
            Preview wallet (EXPO_PUBLIC_MOCK_WALLET) — signing is disabled.
          </Txt>
        ) : null}
        {actions.map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {
              setOpen(false)
              a.onPress()
            }}
          >
            <Feather name={a.icon} size={18} color={colors.accent} />
            <Txt>{a.label}</Txt>
          </Pressable>
        ))}
        <Button
          label="Disconnect"
          variant="ghost"
          onPress={() => {
            setOpen(false)
            disconnect().catch((e: unknown) => toastError(`Could not disconnect: ${formatError(e)}`))
          }}
        />
      </Sheet>
    </>
  )
}

const PREVIEW_COLOR = '#FBBF24'

const styles = StyleSheet.create({
  pill: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 36, paddingHorizontal: 16 },
  pressed: { transform: [{ scale: 0.97 }] },
  dot: { backgroundColor: colors.success, borderRadius: 4, height: 8, width: 8 },
  previewDot: { backgroundColor: PREVIEW_COLOR },
  previewNote: { color: PREVIEW_COLOR, fontSize: 12, marginTop: -space.xs },
  pillText: { color: colors.accent, fontSize: 14, fontVariant: ['tabular-nums'], fontWeight: '600' },
  addressBox: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  address: { color: colors.foreground, flexShrink: 1, fontFamily: 'SpaceMono', fontSize: 13 },
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
  },
  rowPressed: { backgroundColor: colors.cardRaised },
})
