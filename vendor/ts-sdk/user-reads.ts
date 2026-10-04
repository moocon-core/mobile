import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token'
import type { Connection, PublicKey } from '@solana/web3.js'
import type { VaultAccount } from './accounts'
import { parseVault } from './fetcher'
import type { UserVaultRef } from './user-txs'
import type { Vault } from './vault'

export type VaultWithIndex = VaultAccount & { address: PublicKey; index: number }

/** Every initialised vault, in index order. */
export async function fetchVaults(program: Vault): Promise<VaultWithIndex[]> {
  const entries = await program.program.account.vault.all()
  const state = await program.fetcher.getState()
  const result: VaultWithIndex[] = []
  for (let i = 0; i <= state.lastVault; i++) {
    const [address] = program.fetcher.getVaultAddress(i)
    const entry = entries.find((e) => e.publicKey.equals(address))
    if (entry) result.push({ index: i, address, ...parseVault(entry.account) })
  }
  return result
}

/** Raw balance of `owner`'s ATA for `mint`; a missing ATA reads as 0. */
export async function fetchAtaBalance(
  program: Vault,
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false
): Promise<bigint> {
  const tokenProgram = await program.fetcher.getTokenProgramId(mint)
  const ata = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    tokenProgram
  )
  try {
    const account = await getAccount(connection, ata, undefined, tokenProgram)
    return BigInt(account.amount.toString())
  } catch {
    return 0n
  }
}

/** The vault's own balance of `mint`; unlike a user ATA, a missing account is an error. */
export async function fetchVaultAtaBalance(
  program: Vault,
  connection: Connection,
  vaultAddress: PublicKey,
  mint: PublicKey
): Promise<bigint> {
  const tokenProgram = await program.fetcher.getTokenProgramId(mint)
  const ata = getAssociatedTokenAddressSync(
    mint,
    vaultAddress,
    true,
    tokenProgram
  )
  const account = await getAccount(connection, ata, undefined, tokenProgram)
  return BigInt(account.amount.toString())
}

export interface UserPosition<V> {
  vault: V
  /** Underlying tokens — pTokens are minted 1:1 with the deposit. */
  amount: number
  /** null when the mint has no price yet, not when the value is zero. */
  usd: number | null
  decimals: number
}

/** Every vault's balance for one wallet, so callers can tell "no positions" from "loading". */
export async function fetchUserPositions<V extends UserVaultRef>(
  program: Vault,
  connection: Connection,
  vaults: readonly V[],
  owner: PublicKey,
  mintInfo: (mint: PublicKey) => { decimals: number; price: number | null }
): Promise<UserPosition<V>[]> {
  const positions: UserPosition<V>[] = []
  for (const vault of vaults) {
    const { decimals, price } = mintInfo(vault.mint)
    const raw = await fetchAtaBalance(program, connection, vault.pMint, owner)
    let amount = Number(raw) / 10 ** decimals
    if (!Number.isFinite(amount)) amount = 0
    positions.push({
      vault,
      amount,
      usd: price != null ? amount * price : null,
      decimals
    })
  }
  return positions
}
