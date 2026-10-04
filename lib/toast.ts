import { Linking } from 'react-native'
import * as Haptics from 'expo-haptics'
import { create } from 'zustand'
import { solscanUrl } from '@moocon/shared'
import { walletErrorKind } from '@/lib/wallet-errors'

export interface Toast {
  /** Changes on every show, so a repeated message restarts its timer and animation. */
  id: number
  kind: 'success' | 'error' | 'info'
  text: string
  /** Second, quieter line under the text. */
  detail?: string
  action?: { label: string; onPress: () => void }
}

const DURATION_MS = 4000
let nextId = 1
let hideTimer: ReturnType<typeof setTimeout> | undefined

export const useToastStore = create<{ toast: Toast | null; dismiss: () => void }>((set) => ({
  toast: null,
  dismiss: () => {
    clearTimeout(hideTimer)
    set({ toast: null })
  },
}))

function show(toast: Omit<Toast, 'id'>) {
  const current = useToastStore.getState().toast
  // The same message firing again (several queries failing offline) keeps one toast up instead of stacking.
  const id = current?.text === toast.text ? current.id : nextId++
  useToastStore.setState({ toast: { ...toast, id } })
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => useToastStore.setState({ toast: null }), toast.action ? DURATION_MS + 1500 : DURATION_MS)
}

export function openSolscan(path: string, rpcEndpoint: string) {
  Linking.openURL(solscanUrl(path, rpcEndpoint.includes('devnet'))).catch(() => {})
}

export function toastSuccess(text: string, tx?: { sig: string | null; rpcEndpoint: string }) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  show({
    kind: 'success',
    text,
    action: tx?.sig ? { label: 'Solscan ↗', onPress: () => openSolscan(`/tx/${tx.sig}`, tx.rpcEndpoint) } : undefined,
  })
}

/** Neutral notice for things the user chose, like cancelling in the wallet: no red, light haptic. */
export function toastInfo(text: string, detail?: string) {
  Haptics.selectionAsync().catch(() => {})
  show({ kind: 'info', text, detail })
}

/**
 * Routes a wallet failure: cancelling is a choice, so it gets a calm notice; anything else is an error.
 * `what` names the action for the cancel copy ("Deposit", "Signature"…).
 */
export function toastWalletError(e: unknown, what: string, fallback: string) {
  const kind = walletErrorKind(e)
  if (kind === 'cancelled') toastInfo(`${what} cancelled`, 'Nothing was signed or sent.')
  else if (kind === 'timeout') toastError('Wallet didn’t respond in time. Try again.')
  else if (kind === 'no-wallet') toastError('No Solana wallet found on this device.')
  else {
    const message = e instanceof Error ? e.message : ''
    // Wallet protocol failures read like "-32603/Error while processing sign request: …".
    const protocol = message.match(/^-?\d+\/(.*)$/s)
    if (protocol) toastError('The wallet couldn’t complete this request.', protocol[1].trim())
    else toastError(message || fallback)
  }
}

export function toastError(text: string, detail?: string) {
  if (useToastStore.getState().toast?.text !== text) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
  }
  show({ kind: 'error', text, detail })
}
