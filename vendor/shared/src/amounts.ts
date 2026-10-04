import { numberFormat } from './intl'
import { PublicKey } from '@solana/web3.js'
import { getLendingAccountsForMint, getSwapOutputToken } from './sdk'
import type { Drawing, MintData } from './api/types'

const FALLBACK_DECIMALS = 6
const MAX_DECIMALS = 18

// Decimals for a mint, preferring the API's mint-data and falling back to the
// SDK's static lending table. The API payload is an unchecked cast, so a
// missing or malformed `decimals` has to be treated as absent rather than
// trusted — silently defaulting to 6 is what made 9-decimal WSOL amounts
// render 1000x too large.
export function resolveMintDecimals(
  mint: string | null | undefined,
  metadata?: MintData
): number {
  const fromApi = Number(metadata?.decimals)
  if (Number.isInteger(fromApi) && fromApi >= 0) {
    return Math.min(fromApi, MAX_DECIMALS)
  }
  if (!mint) return FALLBACK_DECIMALS
  try {
    return getLendingAccountsForMint(new PublicKey(mint))?.decimal ?? FALLBACK_DECIMALS
  } catch {
    return FALLBACK_DECIMALS
  }
}

// Base units <-> decimal strings, done with string/BigInt math only. Scaling a
// 9-decimal amount through float64 is lossy — `8.2 * 1e9` is 8199999999.999999,
// which floors to a lamport short of what the user typed.
export function formatRawAmount(
  raw: bigint,
  decimals: number,
  group = false
): string {
  const negative = raw < 0n
  const abs = negative ? -raw : raw
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const fraction = (abs % base)
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')
  const wholeStr = group ? whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : whole.toString()
  return `${negative ? '-' : ''}${wholeStr}${fraction ? `.${fraction}` : ''}`
}

export function parseRawAmount(value: string, decimals: number): bigint {
  const [whole = '', fraction = ''] = value.trim().split('.')
  const digits = `${whole.replace(/\D/g, '') || '0'}${fraction.replace(/\D/g, '').padEnd(decimals, '0').slice(0, decimals)}`
  return BigInt(digits)
}

export interface ResolvedPayout {
  swapped: boolean
  symbol: string
  icon: string
  decimals: number
  raw: bigint | null
  /** Display amount, e.g. "1,234.50". */
  text: string
  /** "Swapped from 12.00 JupUSD" for swapped prizes, else undefined. */
  title: string | undefined
}

function fmtTokenAmount(raw: bigint | number | null, decimals: number) {
  if (raw === null) return '—'
  return numberFormat({
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals
  }).format((Number(raw) / 10 ** decimals))
}

// The token a drawing actually paid out in: the swap output when the prize
// was swapped, otherwise the vault token. Swap outputs are not in the API's
// mint-data, so their symbol/icon come from the SDK's swap token list.
export function resolvePayout(
  d: Drawing,
  getMint: (address: string) => MintData | undefined
): ResolvedPayout {
  const mint = d.payout?.mint ?? d.mint
  const metadata = mint ? getMint(mint) : undefined
  let swapToken: ReturnType<typeof getSwapOutputToken> = null
  if (mint && !metadata) {
    try {
      swapToken = getSwapOutputToken(new PublicKey(mint))
    } catch {
      swapToken = null
    }
  }
  const amount = d.payout ? d.payout.amount : d.amount
  const raw = amount === null || amount === undefined ? null : BigInt(amount)
  const decimals =
    d.payout?.decimals ?? swapToken?.decimals ?? resolveMintDecimals(mint, metadata)
  const swapped = d.payout?.swapped ?? false
  let title: string | undefined
  if (swapped) {
    const original = d.mint ? getMint(d.mint) : undefined
    title = `Swapped from ${fmtTokenAmount(d.amount, resolveMintDecimals(d.mint, original))} ${original?.symbol ?? ''}`.trim()
  }
  return {
    swapped,
    symbol: metadata?.symbol ?? swapToken?.symbol ?? '',
    icon: metadata?.icon ?? swapToken?.icon ?? '',
    decimals,
    raw,
    text: fmtTokenAmount(raw, decimals),
    title
  }
}

/** Lamports left untouched on a SOL deposit to cover tx fee + WSOL ATA rent. */
export const SOL_FEE_RESERVE_LAMPORTS = 20_000_000n // 0.02 SOL

export function normalizeDecimals(decimals: number) {
  const parsed = Number(decimals)
  if (!Number.isInteger(parsed) || parsed < 0) return FALLBACK_DECIMALS
  return Math.min(parsed, MAX_DECIMALS)
}

export function rawToDisplay(raw: bigint, decimals: number) {
  return Number(raw) / 10 ** decimals
}

// Wrapping SOL spends the wallet's lamports, not an SPL balance — and those
// same lamports pay the tx fee and the WSOL ATA rent, so hold a margin back.
export function depositableBalance(
  isSol: boolean,
  nativeSolRaw: bigint,
  userTokenRaw: bigint
): { raw: bigint; solShortfall: boolean } {
  if (!isSol) return { raw: userTokenRaw, solShortfall: false }
  const solShortfall = nativeSolRaw < SOL_FEE_RESERVE_LAMPORTS
  return {
    raw: solShortfall ? 0n : nativeSolRaw - SOL_FEE_RESERVE_LAMPORTS,
    solShortfall
  }
}

/** API raw-amount string → bigint; malformed or missing values read as 0. */
export function parseRawOrZero(raw: string | null | undefined): bigint {
  try {
    return raw ? BigInt(raw) : 0n
  } catch {
    return 0n
  }
}
