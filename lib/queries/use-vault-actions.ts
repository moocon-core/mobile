import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { Transaction, type PublicKey } from '@solana/web3.js'
import type { RewardCommitmentAccount } from 'ts-sdk/fetcher'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import {
  buildClaimIxChunks,
  buildCloseSwapPreferenceTx,
  buildDepositTx,
  buildRedeemTx,
  buildSetSwapPreferenceTx,
  finalizeTx,
} from 'ts-sdk/user-txs'
import {
  readPayout,
  swapPreferenceInvalidationKey,
  txAmountText,
  vaultActionInvalidationKeys,
  type VaultWithAddress,
} from '@moocon/shared'
import { useMintStore } from '@/lib/mint-store'
import { toastSuccess, toastWalletError } from '@/lib/toast'
import { useVaultProgram } from '@/lib/vault-program'
import { useSendAndConfirm, useWalletAddress } from '@/lib/wallet'

function invalidateAfterAction(qc: QueryClient, vault: VaultWithAddress) {
  // Refreshing balances must never repaint a landed tx as a failure.
  Promise.all(vaultActionInvalidationKeys(vault).map((queryKey) => qc.invalidateQueries({ queryKey }))).catch(() => {})
}

function onTxError(what: string, fallback: string) {
  return (e: Error) => toastWalletError(e, what, fallback)
}

function useTxDeps() {
  const owner = useWalletAddress()
  const program = useVaultProgram()
  const { connection } = useMobileWallet()
  const send = useSendAndConfirm()
  const qc = useQueryClient()
  return { owner, program, connection, send, qc }
}

export function useDeposit(vault: VaultWithAddress) {
  const { owner, program, connection, send, qc } = useTxDeps()
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!owner || !program) throw new Error('Wallet not connected')
      return send(await buildDepositTx(program, connection, owner, vault, amount))
    },
    onSuccess: (sig, amount) => {
      const mint = vault.mint.toBase58()
      toastSuccess(txAmountText('Deposited', amount, mint, useMintStore.getState().getMint(mint)), {
        sig,
        rpcEndpoint: connection.rpcEndpoint,
      })
      invalidateAfterAction(qc, vault)
    },
    onError: onTxError('Deposit', 'Deposit failed'),
  })
}

export function useRedeem(vault: VaultWithAddress) {
  const { owner, program, connection, send, qc } = useTxDeps()
  return useMutation({
    mutationFn: async ({ amount, isMax }: { amount: bigint; isMax: boolean }) => {
      if (!owner || !program) throw new Error('Wallet not connected')
      const { tx, withdrawerTokenAccount, requested } = await buildRedeemTx(
        program,
        connection,
        owner,
        vault,
        amount,
        isMax,
      )
      return { sig: await send(tx), withdrawerTokenAccount, requested }
    },
    onSuccess: async ({ sig, withdrawerTokenAccount, requested }) => {
      // The payout can be under the pTokens burned: withdraw.rs pays `delta.min(entitled)`.
      const payout = await readPayout(connection, sig, withdrawerTokenAccount)
      const mint = vault.mint.toBase58()
      toastSuccess(txAmountText('Withdrew', payout ?? requested, mint, useMintStore.getState().getMint(mint)), {
        sig,
        rpcEndpoint: connection.rpcEndpoint,
      })
      invalidateAfterAction(qc, vault)
    },
    onError: onTxError('Withdrawal', 'Withdrawal failed'),
  })
}

export function useSetSwapPreference(vault: VaultWithAddress) {
  const { owner, program, connection, send, qc } = useTxDeps()
  return useMutation({
    mutationFn: async (outputMint: PublicKey) => {
      if (!owner || !program) throw new Error('Wallet not connected')
      return send(await buildSetSwapPreferenceTx(program, connection, owner, vault, outputMint))
    },
    onSuccess: (sig) => {
      toastSuccess('Prize swap enabled', { sig, rpcEndpoint: connection.rpcEndpoint })
      qc.invalidateQueries({ queryKey: swapPreferenceInvalidationKey(vault) }).catch(() => {})
    },
    onError: onTxError('Swap change', 'Enabling swap failed'),
  })
}

export function useCloseSwapPreference(vault: VaultWithAddress) {
  const { owner, program, connection, send, qc } = useTxDeps()
  return useMutation({
    mutationFn: async () => {
      if (!owner || !program) throw new Error('Wallet not connected')
      return send(await buildCloseSwapPreferenceTx(program, connection, owner, vault))
    },
    onSuccess: (sig) => {
      toastSuccess('Prize swap disabled', { sig, rpcEndpoint: connection.rpcEndpoint })
      qc.invalidateQueries({ queryKey: swapPreferenceInvalidationKey(vault) }).catch(() => {})
    },
    onError: onTxError('Swap change', 'Disabling swap failed'),
  })
}

type ClaimPair = { reward: RewardCommitmentAccount; vault: VaultWithAddress }

// Each chunk is its own wallet approval; the last signature backs the toast.
function useClaim(successText: string, fallback: string) {
  const { owner, program, connection, send, qc } = useTxDeps()
  return useMutation({
    mutationFn: async (pairs: ClaimPair[]) => {
      if (!owner || !program) throw new Error('Wallet not connected')
      let sig: string | null = null
      for (const chunk of await buildClaimIxChunks(program, owner, pairs)) {
        sig = await send(await finalizeTx(connection, owner, new Transaction().add(...chunk)))
      }
      return sig
    },
    onSuccess: (sig) => {
      toastSuccess(successText, { sig, rpcEndpoint: connection.rpcEndpoint })
      qc.invalidateQueries({ queryKey: ['rewards', 'user'] }).catch(() => {})
    },
    onError: onTxError('Claim', fallback),
  })
}

export function useClaimReward() {
  return useClaim('Reward claimed!', 'Claim failed')
}

export function useClaimAllRewards() {
  return useClaim('All rewards claimed!', 'Claim all failed')
}
