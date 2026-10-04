import type { Connection, PublicKey } from '@solana/web3.js'
import type { VaultWithAddress } from './stores/vaults'
import { queryKeys } from './api/query-keys'
import type { MintData } from './api/types'
import { formatRawAmount, resolveMintDecimals } from './amounts'

// The withdrawn amount cannot be read off pre/postTokenBalances: on the SOL
// vault the withdrawer's WSOL account is closed later in the same tx, so it has
// no post-balance. Instruction data survives that, so the payout is taken from
// the program's own transfer CPI. Best-effort — the caller falls back to the
// requested amount, and a throw here must never repaint a landed withdrawal as
// a failure.
export async function readPayout(
  connection: Pick<Connection, 'getParsedTransaction'>,
  sig: string,
  destination: PublicKey,
  retryDelayMs = 400
): Promise<bigint | null> {
  const dest = destination.toBase58()
  // `confirmTransaction` returns before the RPC has the tx in its history, so a
  // single immediate lookup comes back null a good fraction of the time.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const tx = await connection.getParsedTransaction(sig, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })
      const inner = tx?.meta?.innerInstructions?.flatMap((i) => i.instructions) ?? []
      for (const ix of inner) {
        if (!('parsed' in ix) || ix.program !== 'spl-token') continue
        const { type, info } = ix.parsed
        if (type !== 'transferChecked' && type !== 'transfer') continue
        if (info?.destination !== dest) continue
        const raw = info.tokenAmount?.amount ?? info.amount
        if (raw != null) return BigInt(raw)
      }
      if (tx) return null
    } catch {
      return null
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, retryDelayMs))
  }
  return null
}

/** Query-key prefixes whose data moves after a deposit or withdrawal. */
export function vaultActionInvalidationKeys(vault: VaultWithAddress): readonly (readonly string[])[] {
  return [
    queryKeys.vaults.all(),
    ['points'],
    ['user', 'deposited', vault.address.toBase58()],
    ['user', 'pTokenBalance', vault.address.toBase58()],
    ['user', 'tokenBalance', vault.mint.toBase58()],
    ['user', 'totalDepositsUsd'],
    ['user', 'nativeSol']
  ]
}

// The owner is left off the key so the prefix covers whichever wallet is connected.
export function swapPreferenceInvalidationKey(vault: VaultWithAddress): readonly string[] {
  return ['user', 'swapPreference', vault.address.toBase58()]
}

// Always renders the amount: decimals fall back to the SDK table, so missing mint-data costs only the symbol.
export function txAmountText(verb: string, raw: bigint, mint: string, meta: MintData | undefined): string {
  const amount = formatRawAmount(raw, resolveMintDecimals(mint, meta), true)
  return `${verb} ${amount}${meta?.symbol ? ` ${meta.symbol}` : ''}`
}
