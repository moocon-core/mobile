import { useCallback, useMemo } from 'react'
import { PublicKey, type Transaction } from '@solana/web3.js'
import { toUint8Array, transact, useMobileWallet, type Web3MobileWallet } from '@wallet-ui/react-native-web3js'
import { confirmFinalizedTx } from 'ts-sdk/user-txs'
import { ellipsify } from '@moocon/shared'

// Dev-only: read the app as another wallet (set EXPO_PUBLIC_MOCK_WALLET in .env.local). Signing still uses the real one.
const MOCK_WALLET = __DEV__ ? process.env.EXPO_PUBLIC_MOCK_WALLET : undefined
/** True while previewing as EXPO_PUBLIC_MOCK_WALLET; signing would use the real wallet, so it's blocked. */
export const IS_PREVIEW_WALLET = Boolean(MOCK_WALLET)
export const PREVIEW_SIGNING_ERROR = 'Preview wallet: signing is disabled'

// MWA "authorization failed": the wallet no longer accepts the saved auth token.
const AUTHORIZATION_FAILED = -1

export function useWalletAddress(): PublicKey | null {
  // wallet-ui's cache reviver restores only `publicKey`, so after a restart `address` is a base58 string.
  const raw = useMobileWallet().account?.address as PublicKey | string | undefined
  const base58 = MOCK_WALLET || raw?.toString()
  return useMemo(() => (base58 ? new PublicKey(base58) : null), [base58])
}

type AuthorizedAccount = { address: string; label?: string; icon?: string }
type StoredAccount = { address: PublicKey; addressBase64: string; label: string; icon?: string; publicKey: PublicKey }
// wallet-ui keeps these on its context but doesn't type them.
type WalletContext = ReturnType<typeof useMobileWallet> & {
  chain: string
  identity: { name?: string; uri?: string; icon?: string }
  store: {
    $authToken: { get(): string | undefined }
    $selectedAccount: { get(): StoredAccount | undefined }
    persist(auth: { accounts: StoredAccount[]; authToken: string; selectedAccount: StoredAccount }): Promise<void>
  }
}

// Inside a session the wallet's rejection is still the raw native error ({ code: 'JSON_RPC_ERROR',
// userInfo.jsonRpcErrorCode }); MWA only converts it to a typed error once the session has ended.
function isAuthorizationFailed(e: unknown) {
  const err = e as { code?: unknown; userInfo?: { jsonRpcErrorCode?: unknown } }
  return (
    err?.code === AUTHORIZATION_FAILED ||
    (err?.code === 'JSON_RPC_ERROR' && err.userInfo?.jsonRpcErrorCode === AUTHORIZATION_FAILED)
  )
}

function toStoredAccount(account: AuthorizedAccount): StoredAccount {
  const address = new PublicKey(toUint8Array(account.address))
  return {
    address,
    addressBase64: account.address,
    icon: account.icon,
    label: account.label ?? ellipsify(address.toString(), 8),
    publicKey: address,
  }
}

/**
 * Runs `fn` inside one wallet session after authorizing. Mirrors wallet-ui's authorizeSession, but retries
 * a rejected auth token by its JSON-RPC code: wallet-ui's own retry checks `instanceof` on an error that is
 * still the raw native one at that point, so a wallet that expired our token (Phantom does) ended the
 * session before any approval screen showed.
 */
function useAuthorizedTransact() {
  const ctx = useMobileWallet() as WalletContext
  const { chain, identity, store } = ctx
  return useCallback(
    async <T>(fn: (wallet: Web3MobileWallet, account: StoredAccount) => Promise<T>) =>
      transact(async (wallet) => {
        const authToken = store.$authToken.get()
        let result
        try {
          result = await wallet.authorize({ auth_token: authToken, chain, identity })
        } catch (e) {
          if (!isAuthorizationFailed(e) || !authToken) throw e
          result = await wallet.authorize({ chain, identity })
        }
        const accounts = result.accounts.map(toStoredAccount)
        const previous = store.$selectedAccount.get()
        const selectedAccount = accounts.find((a) => a.addressBase64 === previous?.addressBase64) ?? accounts[0]
        await store.persist({ accounts, authToken: result.auth_token, selectedAccount })
        return fn(wallet, selectedAccount)
      }),
    [chain, identity, store],
  )
}

/** Sends a finalized tx (fee payer + blockhash set) through MWA and waits for confirmation. */
export function useSendAndConfirm() {
  const { connection } = useMobileWallet()
  const authorizedTransact = useAuthorizedTransact()
  return useCallback(
    async (tx: Transaction) => {
      if (IS_PREVIEW_WALLET) throw new Error(PREVIEW_SIGNING_ERROR)
      const minContextSlot = await connection.getSlot('confirmed')
      const [sig] = await authorizedTransact(async (wallet, account) => {
        // Re-authorizing can land on a different wallet account than the one the tx was built for.
        if (tx.feePayer && !tx.feePayer.equals(account.publicKey)) {
          throw new Error(`Wallet switched to ${ellipsify(account.publicKey.toBase58())}. Try again.`)
        }
        return wallet.signAndSendTransactions({ minContextSlot, transactions: [tx] })
      })
      await confirmFinalizedTx(connection, tx, sig)
      return sig
    },
    [connection, authorizedTransact],
  )
}

/** Connects (or refreshes) the wallet authorization, recovering from an expired token like the signing paths. */
export function useConnectWallet() {
  const authorizedTransact = useAuthorizedTransact()
  return useCallback(() => authorizedTransact(async (_wallet, account) => account), [authorizedTransact])
}

/** Signs one message with the authorized account, in the same session as authorization. */
export function useSignMessage() {
  const authorizedTransact = useAuthorizedTransact()
  return useCallback(
    async (message: Uint8Array) => {
      if (IS_PREVIEW_WALLET) throw new Error(PREVIEW_SIGNING_ERROR)
      const [signature] = await authorizedTransact((wallet, account) =>
        wallet.signMessages({ addresses: [account.addressBase64], payloads: [message] }),
      )
      return signature
    },
    [authorizedTransact],
  )
}
