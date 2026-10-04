import type { DistributionTier } from './sdk'

// The moment a vault's tier balances were last touched on-chain: `accumulated`
// only moves inside `commit`, and a commit stamps `distributedAt` on the tier it
// fires. The newest such stamp is therefore the timestamp every tier's
// `accumulated` is current as of.
export function lastCommitAt(tiers: readonly DistributionTier[]): bigint {
  let latest = 0n
  for (const tier of tiers) {
    if (tier.interval <= 0n) continue
    if (tier.distributedAt > latest) latest = tier.distributedAt
  }
  return latest
}

// `asOfSec` is the last-commit anchor from `lastCommitAt`, not wall-clock now.
// Pairing `accumulated` with the wall clock would shrink the estimate every
// second while the numerator sat frozen between commits.
export function estimateTierPrizeRaw(
  tier: DistributionTier,
  asOfSec: bigint,
  latestPayoutRaw = 0n,
): bigint {
  if (tier.accumulated <= 0n) return latestPayoutRaw > 0n ? latestPayoutRaw : 0n
  if (tier.interval <= 0n || tier.distributedAt <= 0n) {
    return tier.accumulated
  }

  const elapsed = asOfSec - tier.distributedAt
  if (elapsed <= 0n) return tier.accumulated

  // Once the tier is due, its accumulated balance is the best available
  // estimate. Before then, project the observed accrual rate across the full
  // interval. Round to the nearest raw token unit using BigInt throughout.
  const boundedElapsed = elapsed < tier.interval ? elapsed : tier.interval
  const projected = tier.accumulated * tier.interval
  return (projected + boundedElapsed / 2n) / boundedElapsed
}

export function formatRawTokenAmount(raw: bigint, decimals: number): string {
  const safeDecimals = Number.isInteger(decimals) && decimals >= 0 ? Math.min(decimals, 18) : 0
  const nonNegativeRaw = raw > 0n ? raw : 0n

  if (safeDecimals === 0) {
    return nonNegativeRaw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const base = 10n ** BigInt(safeDecimals)
  const whole = (nonNegativeRaw / base).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (nonNegativeRaw % base).toString().padStart(safeDecimals, '0').replace(/0+$/, '')

  return fraction.length > 0 ? `${whole}.${fraction}` : whole
}

export function getTierPrize(
  tier: DistributionTier,
  tokenDecimals: number,
  latestPayoutRaw: bigint,
  asOfSec: bigint,
): string {
  return formatRawTokenAmount(
    estimateTierPrizeRaw(tier, asOfSec, latestPayoutRaw),
    tokenDecimals,
  )
}
