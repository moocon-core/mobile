import { numberFormat } from './intl'
import type { PublicKey } from '@solana/web3.js'
import { formatUsd } from './format'
import { EXCHANGE_RATE_PRECISION } from './sdk'

const EXCHANGE_RATE_PRECISION_NUM = Number(EXCHANGE_RATE_PRECISION)

/**
 * TVL in underlying tokens: the vault's fToken position valued at the vault's
 * own recorded exchange rate — `lastRate` is a high-water mark, so this matches
 * what the program itself would redeem rather than a live quote. Null when the
 * result is not finite.
 */
export function computeTvl(
  fTokenBalance: bigint | number,
  lastRate: bigint,
  decimals: number
): number | null {
  const raw =
    (Number(fTokenBalance) * Number(lastRate)) /
    EXCHANGE_RATE_PRECISION_NUM /
    10 ** decimals
  return Number.isFinite(raw) ? raw : null
}

export interface StatDisplay {
  value: string
  sub: string | null
}

function tokens(amount: number, symbol: string) {
  return `${numberFormat({ maximumFractionDigits: 2 }).format(amount)} ${symbol}`
}

/** "Total Supplied": USD headline with the token amount beneath; null while loading. */
export function suppliedDisplay(
  v: { tvl: number | null; tvlUsd: number | null; tvlUnavailable: boolean },
  symbol: string
): StatDisplay | null {
  if (v.tvlUnavailable) return { value: '—', sub: null }
  if (v.tvlUsd != null) return { value: formatUsd(v.tvlUsd), sub: v.tvl != null ? tokens(v.tvl, symbol) : null }
  if (v.tvl != null) return { value: tokens(v.tvl, symbol), sub: null }
  return null
}

/** "Your Contribution", shaped like `suppliedDisplay`; the token line repeats only under a USD headline. */
export function contributionDisplay(
  connected: boolean,
  deposited: number,
  price: number | null,
  symbol: string
): StatDisplay {
  if (!connected) return { value: '—', sub: null }
  if (price != null) return { value: formatUsd(deposited * price), sub: tokens(deposited, symbol) }
  return { value: tokens(deposited, symbol), sub: null }
}

/** Rewards matched to their loaded vault; rewards for a vault not (yet) loaded are dropped. */
export function pairRewardsWithVaults<R extends { vault: PublicKey }, V extends { address: PublicKey }>(
  rewards: readonly R[],
  vaults: readonly V[]
): { reward: R; vault: V }[] {
  return rewards.flatMap((reward) => {
    const vault = vaults.find((v) => v.address.equals(reward.vault))
    return vault ? [{ reward, vault }] : []
  })
}

/** Sum of priced positions; unpriced ones count as 0 rather than blanking the total. */
export function totalPositionsUsd(positions: readonly { usd: number | null }[]): number {
  return positions.reduce((sum, p) => sum + (p.usd ?? 0), 0)
}

export function formatPositionAmount(amount: number, decimals: number): string {
  return numberFormat({ minimumFractionDigits: 2, maximumFractionDigits: Math.min(decimals, 6) }).format(amount)
}
