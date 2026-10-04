import {
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT
} from '@solana/spl-token'
import {
  type Connection,
  type PublicKey,
  SystemProgram,
  Transaction,
  type TransactionInstruction
} from '@solana/web3.js'
import type { RewardCommitmentAccount } from './fetcher'
import { getLendingAccountsForMint } from './consts'
import { getClaimAccount } from './pdas'
import type { Vault } from './vault'

export interface UserVaultRef {
  index: number
  address: PublicKey
  mint: PublicKey
  pMint: PublicKey
}

const CLAIMS_PER_TX = 5

export async function finalizeTx(
  connection: Connection,
  feePayer: PublicKey,
  tx: Transaction
): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()
  tx.feePayer = feePayer
  tx.recentBlockhash = blockhash
  tx.lastValidBlockHeight = lastValidBlockHeight
  return tx
}

export async function confirmFinalizedTx(
  connection: Connection,
  tx: Transaction,
  signature: string
) {
  if (!tx.recentBlockhash || tx.lastValidBlockHeight == null)
    throw new Error('Transaction was not finalized')
  await connection.confirmTransaction({
    blockhash: tx.recentBlockhash,
    lastValidBlockHeight: tx.lastValidBlockHeight,
    signature
  })
}

export async function buildDepositTx(
  program: Vault,
  connection: Connection,
  owner: PublicKey,
  vault: UserVaultRef,
  amount: bigint
): Promise<Transaction> {
  const la = getLendingAccountsForMint(vault.mint)
  if (!la) throw new Error('Unsupported mint')
  const tokenProgram = await program.fetcher.getTokenProgramId(la.fTokenMint)
  const isSol = vault.mint.equals(NATIVE_MINT)

  const depositorTokenAccount = getAssociatedTokenAddressSync(
    vault.mint,
    owner,
    false,
    tokenProgram
  )
  const depositIx = await program.depositIx({
    depositor: owner,
    vaultIndex: vault.index,
    amount,
    depositorTokenAccount,
    vaultTokenAccount: getAssociatedTokenAddressSync(
      vault.mint,
      vault.address,
      true,
      tokenProgram
    ),
    recipientTokenAccount: getAssociatedTokenAddressSync(
      la.fTokenMint,
      vault.address,
      true,
      tokenProgram
    ),
    mint: vault.mint,
    pMint: vault.pMint,
    depositorPTokenAccount: getAssociatedTokenAddressSync(
      vault.pMint,
      owner,
      false,
      tokenProgram
    ),
    lendingAccounts: la
  })

  const tx = new Transaction()
  if (isSol) {
    const ataInfo = await connection.getAccountInfo(depositorTokenAccount)
    if (!ataInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          owner,
          depositorTokenAccount,
          owner,
          NATIVE_MINT
        )
      )
    }
    tx.add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: depositorTokenAccount,
        lamports: amount
      }),
      createSyncNativeInstruction(depositorTokenAccount)
    )
  }
  tx.add(depositIx)
  if (isSol) {
    // Unwraps the leftover WSOL back to the wallet.
    tx.add(createCloseAccountInstruction(depositorTokenAccount, owner, owner))
  }
  return finalizeTx(connection, owner, tx)
}

export async function buildRedeemTx(
  program: Vault,
  connection: Connection,
  owner: PublicKey,
  vault: UserVaultRef,
  amount: bigint,
  isMax: boolean
): Promise<{
  tx: Transaction
  withdrawerTokenAccount: PublicKey
  requested: bigint
}> {
  const la = getLendingAccountsForMint(vault.mint)
  if (!la) throw new Error('Unsupported mint')
  const tokenProgram = await program.fetcher.getTokenProgramId(la.fTokenMint)
  const isSol = vault.mint.equals(NATIVE_MINT)

  const withdrawerTokenAccount = getAssociatedTokenAddressSync(
    vault.mint,
    owner,
    false,
    tokenProgram
  )
  const withdrawerPTokenAccount = getAssociatedTokenAddressSync(
    vault.pMint,
    owner,
    false,
    tokenProgram
  )

  // The program rejects the u64::MAX "withdraw all" sentinel, so a max
  // withdrawal passes the exact pToken balance read at submit time.
  let requested = amount
  if (isMax) {
    requested = (
      await getAccount(
        connection,
        withdrawerPTokenAccount,
        undefined,
        tokenProgram
      )
    ).amount
    if (requested === 0n) throw new Error('Nothing to withdraw')
  }

  const redeemIx = await program.redeemIx({
    withdrawer: owner,
    vaultIndex: vault.index,
    amount: requested,
    vaultFTokenAccount: getAssociatedTokenAddressSync(
      la.fTokenMint,
      vault.address,
      true,
      tokenProgram
    ),
    vaultTokenAccount: getAssociatedTokenAddressSync(
      vault.mint,
      vault.address,
      true,
      tokenProgram
    ),
    withdrawerTokenAccount,
    mint: vault.mint,
    pMint: vault.pMint,
    withdrawerPTokenAccount,
    claimAccount: getClaimAccount(vault.mint, la.lendingAdmin),
    lendingAccounts: la
  })

  const tx = new Transaction()
  if (!(await connection.getAccountInfo(withdrawerTokenAccount))) {
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        withdrawerTokenAccount,
        owner,
        vault.mint,
        tokenProgram
      )
    )
  }
  tx.add(redeemIx)
  if (isSol) {
    tx.add(createCloseAccountInstruction(withdrawerTokenAccount, owner, owner))
  }
  return {
    tx: await finalizeTx(connection, owner, tx),
    withdrawerTokenAccount,
    requested
  }
}

/** Claim instructions batched so each chunk fits one transaction. */
export async function buildClaimIxChunks(
  program: Vault,
  owner: PublicKey,
  pairs: { reward: RewardCommitmentAccount; vault: UserVaultRef }[]
): Promise<TransactionInstruction[][]> {
  const instructions = await Promise.all(
    pairs.map(({ reward, vault }) =>
      program.claimIx({
        claimer: owner,
        vaultIndex: vault.index,
        round: reward.round,
        pMint: vault.pMint
      })
    )
  )
  const chunks: TransactionInstruction[][] = []
  for (let i = 0; i < instructions.length; i += CLAIMS_PER_TX)
    chunks.push(instructions.slice(i, i + CLAIMS_PER_TX))
  return chunks
}

/**
 * The ATA is created in the same transaction because settlement does not create
 * it: `harvest_and_swap` needs the winner's output account to already exist, and
 * a missing one silently downgrades the payout to plain pTokens
 * (`OUTPUT_ATA_UNAVAILABLE` in api/src/solana/settlement.ts).
 */
export async function buildSetSwapPreferenceTx(
  program: Vault,
  connection: Connection,
  owner: PublicKey,
  vault: UserVaultRef,
  outputMint: PublicKey
): Promise<Transaction> {
  // xStocks are Token-2022, so the ATA has to be derived and created
  // against the mint's own program rather than the legacy default.
  const tokenProgram = await program.fetcher.getTokenProgramId(outputMint)
  const outputAta = getAssociatedTokenAddressSync(
    outputMint,
    owner,
    false,
    tokenProgram
  )
  const preferenceIx = await program.setSwapPreferenceIx({
    user: owner,
    vaultIndex: vault.index,
    outputMint
  })
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      outputAta,
      owner,
      outputMint,
      tokenProgram
    ),
    preferenceIx
  )
  return finalizeTx(connection, owner, tx)
}

export async function buildCloseSwapPreferenceTx(
  program: Vault,
  connection: Connection,
  owner: PublicKey,
  vault: UserVaultRef
): Promise<Transaction> {
  const ix = await program.closeSwapPreferenceIx({
    user: owner,
    vaultIndex: vault.index
  })
  return finalizeTx(connection, owner, new Transaction().add(ix))
}
