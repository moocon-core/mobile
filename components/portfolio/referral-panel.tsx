import { useState } from 'react'
import { Pressable, Share, StyleSheet, TextInput, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Clipboard from '@react-native-clipboard/clipboard'
import { utils } from '@coral-xyz/anchor'
import type { PublicKey } from '@solana/web3.js'
import { REFERRAL_CODE_MAX_LENGTH } from 'ts-sdk/consts'
import { getCreateReferralMessage, getReferralMessage } from 'ts-sdk/referrals'
import { getFriendlyError, getReferralLink, sanitizeReferralCode } from '@moocon/shared'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Txt } from '@/components/ui/txt'
import { AppConfig } from '@/constants/app-config'
import { colors, radius, space } from '@/constants/theme'
import { useCreateReferral, useReferrals, useUseReferral } from '@/lib/queries/use-referrals'
import { toastError, toastSuccess, toastWalletError } from '@/lib/toast'
import { IS_PREVIEW_WALLET, PREVIEW_SIGNING_ERROR, useSignMessage } from '@/lib/wallet'

type Mode = 'create' | 'use'

/** One-row referral summary; creating or redeeming a code happens in a sheet. */
export function ReferralPanel({ owner, initialCode }: { owner: PublicKey; initialCode: string }) {
  const signMessage = useSignMessage()
  const wallet = owner.toBase58()
  const { data: referrals, isLoading } = useReferrals(wallet)
  const createReferral = useCreateReferral()
  const useReferral = useUseReferral()
  const [createCode, setCreateCode] = useState('')
  const [useCode, setUseCode] = useState(initialCode)
  // A shared ?ref= link lands straight in the redeem sheet.
  const [mode, setMode] = useState<Mode | null>(initialCode ? 'use' : null)

  const code = referrals?.code ?? null
  const referredBy = referrals?.referredBy ?? null
  const link = code ? getReferralLink(AppConfig.uri, code) : ''

  async function sign(message: string) {
    const signature = await signMessage(new TextEncoder().encode(message))
    return utils.bytes.bs58.encode(signature)
  }

  async function submit(kind: Mode) {
    const value = (kind === 'create' ? createCode : useCode).trim()
    if (!value) return
    if (IS_PREVIEW_WALLET) {
      toastError(PREVIEW_SIGNING_ERROR)
      return
    }
    let signature: string
    try {
      signature = await sign(
        kind === 'create' ? getCreateReferralMessage(value, wallet) : getReferralMessage(value, wallet),
      )
    } catch (e) {
      toastWalletError(e, 'Signature', 'Could not sign the message')
      return
    }
    const mutation = kind === 'create' ? createReferral : useReferral
    mutation.mutate(
      { wallet, code: value, signature },
      {
        onSuccess: () => {
          toastSuccess(kind === 'create' ? 'Referral code created!' : 'Referral code applied!')
          if (kind === 'create') setCreateCode('')
          else setUseCode('')
          setMode(null)
        },
        onError: (e) => toastError(getFriendlyError(e)),
      },
    )
  }

  const creating = mode === 'create'
  const pending = creating ? createReferral.isPending : useReferral.isPending
  const value = creating ? createCode : (referredBy ?? useCode)

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Txt style={styles.label}>Your referral code</Txt>
          {code ? (
            <Txt style={styles.code} numberOfLines={1}>
              {code}
            </Txt>
          ) : (
            <Txt style={styles.empty}>{isLoading ? '…' : 'Not created yet'}</Txt>
          )}
        </View>
        {code ? (
          <>
            <IconButton
              icon="copy"
              label="Copy referral link"
              onPress={() => {
                Clipboard.setString(link)
                toastSuccess('Referral link copied!')
              }}
            />
            <IconButton
              icon="share-2"
              label="Share referral link"
              onPress={() =>
                Share.share({ message: `Join me on Moocon! Use my referral code: ${code}\n${link}` }).catch(() => {})
              }
            />
          </>
        ) : (
          <Button label="Create" size="sm" disabled={isLoading} onPress={() => setMode('create')} />
        )}
      </View>
      <View style={styles.footer}>
        {referredBy ? (
          <Txt style={styles.footerText}>
            Referred by <Txt style={styles.footerStrong}>{referredBy}</Txt>
          </Txt>
        ) : (
          <Pressable onPress={() => setMode('use')} hitSlop={8} accessibilityRole="button">
            <Txt style={styles.link}>Have a friend&apos;s code?</Txt>
          </Pressable>
        )}
      </View>

      <Sheet
        open={mode !== null}
        onClose={() => setMode(null)}
        title={creating ? 'Create referral code' : 'Redeem a code'}
      >
        <View style={styles.form}>
          <TextInput
            value={value}
            onChangeText={(v) => (creating ? setCreateCode : setUseCode)(sanitizeReferralCode(v))}
            editable={creating || !referredBy}
            maxLength={REFERRAL_CODE_MAX_LENGTH}
            placeholder={creating ? 'Your code' : "Friend's code"}
            placeholderTextColor={colors.subtle}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Txt variant="small" style={styles.hint}>
            Letters and digits only, up to {REFERRAL_CODE_MAX_LENGTH} characters
          </Txt>
          <Button
            label={creating ? (pending ? 'Creating…' : 'Create') : pending ? 'Applying…' : 'Apply'}
            size="sm"
            loading={pending}
            disabled={isLoading || !value.trim() || (!creating && !!referredBy)}
            onPress={() => mode && submit(mode)}
          />
        </View>
      </Sheet>
    </View>
  )
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <Feather name={icon} size={16} color={colors.accent} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.md,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  info: { flex: 1, gap: 2 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  code: { color: colors.title, fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  empty: { color: colors.subtle, fontSize: 13 },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  iconPressed: { backgroundColor: 'rgba(96, 165, 250, 0.24)' },
  footer: {
    borderTopColor: colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: space.md,
    paddingTop: space.sm,
  },
  footerText: { color: colors.muted, fontSize: 12 },
  footerStrong: { color: colors.foreground, fontSize: 12, fontWeight: '700' },
  link: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  form: { gap: space.sm },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 16,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  hint: { fontSize: 11, marginBottom: space.sm },
})
