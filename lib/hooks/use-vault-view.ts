import { getLendingAccountsForMint } from 'ts-sdk/consts'
import { computeTvl, resolveMintDecimals, type VaultWithAddress } from '@moocon/shared'
import { useVaultTokenBalance } from '@/lib/queries/use-vaults'
import { useMintStore } from '@/lib/mint-store'

export interface VaultView {
  name: string
  icon: string
  decimals: number
  price: number | null
  tvl: number | null
  tvlUsd: number | null
  /** TVL can't be read at all (no lending accounts / missing ATA) — distinct from still loading. */
  tvlUnavailable: boolean
}

export function useVaultView(vault: VaultWithAddress): VaultView {
  const mintAddress = vault.mint.toBase58()
  const metadata = useMintStore((s) => s.getMint(mintAddress))
  const lendingAccounts = getLendingAccountsForMint(vault.mint)
  const decimals = resolveMintDecimals(mintAddress, metadata)
  const price = metadata?.price ?? null

  const { data: fTokenBalance, isError } = useVaultTokenBalance(vault.address, lendingAccounts?.fTokenMint)
  const tvl = fTokenBalance != null ? computeTvl(fTokenBalance, vault.lastRate, decimals) : null
  const tvlUsd = tvl != null && price != null ? tvl * price : null

  return {
    name: metadata?.symbol ?? 'Unknown',
    icon: metadata?.icon ?? '',
    decimals,
    price,
    tvl,
    tvlUsd: tvlUsd != null && Number.isFinite(tvlUsd) ? tvlUsd : null,
    tvlUnavailable: !lendingAccounts || isError || (fTokenBalance != null && tvl === null),
  }
}
