import { useQuery } from '@tanstack/react-query'
import type { PublicKey } from '@solana/web3.js'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import type { SwapPreferenceAccount } from 'ts-sdk/fetcher'
import {
  fetchAtaBalance,
  fetchUserPositions,
  fetchVaultAtaBalance,
  fetchVaults,
  type UserPosition,
} from 'ts-sdk/user-reads'
import { queryKeys, resolveMintDecimals, type VaultWithAddress } from '@moocon/shared'
import { useMintStore } from '@/lib/mint-store'
import { useVaultProgram } from '@/lib/vault-program'

export function useAllVaults() {
  const program = useVaultProgram()
  return useQuery({
    queryKey: queryKeys.vaults.all(),
    queryFn: async (): Promise<VaultWithAddress[]> => {
      if (!program) throw new Error('Vault program not initialized')
      return fetchVaults(program)
    },
    enabled: Boolean(program),
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 30_000,
  })
}

export function useVaultTokenBalance(vaultAddress: PublicKey | undefined, mint: PublicKey | undefined) {
  const { connection } = useMobileWallet()
  const program = useVaultProgram()
  return useQuery({
    queryKey: queryKeys.vaults.tokenBalance(vaultAddress?.toBase58() ?? '', mint?.toBase58() ?? ''),
    queryFn: async (): Promise<bigint> => {
      if (!program || !vaultAddress || !mint) throw new Error('Missing vault program, address, or mint')
      return fetchVaultAtaBalance(program, connection, vaultAddress, mint)
    },
    enabled: Boolean(program) && Boolean(vaultAddress) && Boolean(mint),
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 30_000,
  })
}

export function useUserTokenBalance(mint: PublicKey | undefined, owner: PublicKey | null | undefined) {
  const { connection } = useMobileWallet()
  const program = useVaultProgram()
  return useQuery({
    queryKey: queryKeys.user.tokenBalance(mint?.toBase58() ?? '', owner?.toBase58() ?? ''),
    queryFn: async (): Promise<bigint> => {
      if (!program || !mint || !owner) return 0n
      return fetchAtaBalance(program, connection, mint, owner)
    },
    enabled: Boolean(program) && Boolean(mint) && Boolean(owner),
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 15_000,
  })
}

/** pTokens are minted 1:1 with the deposit, so this is the deposited underlying amount. */
export function useUserPTokenBalance(
  vault: VaultWithAddress | undefined,
  owner: PublicKey | null | undefined,
  decimals: number,
) {
  const { connection } = useMobileWallet()
  const program = useVaultProgram()
  return useQuery({
    queryKey: queryKeys.user.pTokenBalance(vault?.address.toBase58() ?? '', owner?.toBase58() ?? ''),
    queryFn: async (): Promise<number> => {
      if (!program || !vault || !owner) return 0
      return Number(await fetchAtaBalance(program, connection, vault.pMint, owner)) / 10 ** decimals
    },
    enabled: Boolean(program) && Boolean(vault) && Boolean(owner),
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 15_000,
  })
}

export function useNativeSolBalance(owner: PublicKey | null | undefined) {
  const { connection } = useMobileWallet()
  return useQuery({
    queryKey: ['user', 'nativeSol', owner?.toBase58() ?? ''],
    queryFn: async (): Promise<bigint> => (owner ? BigInt(await connection.getBalance(owner)) : 0n),
    enabled: Boolean(owner),
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 15_000,
  })
}

/** Every vault's balance for one wallet in a single query; also the source of total deposits. */
export function useUserPositions(vaults: VaultWithAddress[], owner: PublicKey | null | undefined) {
  const { connection } = useMobileWallet()
  const program = useVaultProgram()
  const getMint = useMintStore((s) => s.getMint)
  return useQuery({
    queryKey: queryKeys.user.positions(owner?.toBase58() ?? '', vaults.map((v) => v.address.toBase58()).join(',')),
    queryFn: async (): Promise<UserPosition<VaultWithAddress>[]> => {
      if (!program || !owner) return []
      return fetchUserPositions(program, connection, vaults, owner, (mint) => {
        const metadata = getMint(mint.toBase58())
        return { decimals: resolveMintDecimals(mint.toBase58(), metadata), price: metadata?.price ?? null }
      })
    },
    enabled: Boolean(program) && Boolean(owner) && vaults.length > 0,
    staleTime: 15_000,
    gcTime: 60_000,
    refetchInterval: 15_000,
  })
}

/** `null` is the answer, not an error — the account's absence is the opt-out. */
export function useSwapPreference(vault: VaultWithAddress | undefined, owner: PublicKey | null | undefined) {
  const program = useVaultProgram()
  return useQuery({
    queryKey: queryKeys.user.swapPreference(vault?.address.toBase58() ?? '', owner?.toBase58() ?? ''),
    queryFn: async (): Promise<SwapPreferenceAccount | null> => {
      if (!program || !vault || !owner) return null
      return await program.fetcher.getSwapPreference(owner, vault.address)
    },
    enabled: Boolean(program) && Boolean(vault) && Boolean(owner),
    staleTime: 15_000,
    gcTime: 60_000,
  })
}

export function useUserRewards(owner: PublicKey | null | undefined) {
  const program = useVaultProgram()
  return useQuery({
    queryKey: ['rewards', 'user', owner?.toBase58() ?? ''],
    queryFn: () => program!.fetcher.getCommitmentsForAddress(owner!),
    enabled: Boolean(program && owner),
    staleTime: 30_000,
    gcTime: 120_000,
    refetchInterval: 30_000,
  })
}
