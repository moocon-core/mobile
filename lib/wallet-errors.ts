import { isUserRejection } from '@moocon/shared'

// MWA JSON-RPC codes a wallet returns when the user says no (mobile-wallet-adapter-protocol).
const AUTHORIZATION_FAILED = -1
const NOT_SIGNED = -3

export type WalletErrorKind = 'cancelled' | 'timeout' | 'no-wallet' | 'other'

/**
 * Normalises the ways a wallet round-trip fails. Declining in the wallet arrives as a protocol error
 * (-1 / -3); backing out of the wallet app arrives as "Local association cancelled by user".
 */
export function walletErrorKind(e: unknown): WalletErrorKind {
  if (!(e instanceof Error)) return 'other'
  const code = (e as { jsonRpcErrorCode?: unknown }).jsonRpcErrorCode ?? (e as { code?: unknown }).code
  if (code === AUTHORIZATION_FAILED || code === NOT_SIGNED) return 'cancelled'
  const msg = e.message.toLowerCase()
  if (isUserRejection(e) || /declin|denied|rejected|not signed|cancel/.test(msg)) return 'cancelled'
  if (msg.includes('wallet_not_found') || msg.includes('wallet not found')) return 'no-wallet'
  if (msg.includes('timed out') || msg.includes('timeout')) return 'timeout'
  return 'other'
}
