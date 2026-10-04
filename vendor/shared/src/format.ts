import { numberFormat } from './intl'
import { clock12, localParts, monthDay } from './dates'
// USD with cents, minus any dangling zeros: $0.00 -> $0, $1.50 -> $1.5.
export function formatUsd(value: number): string {
  const formatted = numberFormat({
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  return formatted.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

/**
 * Chart USD below this keeps cents. Rounding to whole dollars collapses a small
 * range into repeated ticks — an axis over $0–$1.50 renders "$2, $1, $1, $0, $0"
 * instead of distinct values.
 */
export const USD_CENTS_THRESHOLD = 5

/**
 * Axis-tick USD: K/M/B above a thousand, plain dollars below.
 *
 * `withCents` is decided once per axis from its own maximum rather than per
 * value, so every tick on an axis is formatted alike — a per-value rule would
 * print "$0.00" next to "$25" on a wide axis.
 */
export function formatUsdCompact(value: number, withCents = false): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(withCents ? 2 : 0)}`
}

/** True when an axis whose largest value is `max` should show cents. */
export function usdAxisNeedsCents(max: number): boolean {
  return Math.abs(max) < USD_CENTS_THRESHOLD
}

/**
 * Tooltip USD — a single value, so the cents rule applies to that value alone.
 */
export function formatUsdValue(value: number): string {
  const digits = Math.abs(value) < USD_CENTS_THRESHOLD ? 2 : 0
  return numberFormat({
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}

export function shortKey(key: string | null | undefined): string {
  if (!key) return '—'
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

// Prize-sized USD: sub-dollar prizes keep 4 decimals so they don't round to $0.00.
export function formatPrizeUsd(v: number): string {
  if (v > 0 && v < 0.0001) return '<$0.0001'
  return numberFormat({
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: v < 1 ? 4 : 2
  }).format(v)
}

export function formatApr(apr: number): string {
  const digits = apr >= 100 ? 0 : 2
  return `${numberFormat({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(apr)}%`
}

export function formatTokenAmount(v: number, decimals: number): string {
  return numberFormat({ minimumFractionDigits: 2, maximumFractionDigits: decimals }).format(v)
}

/** Unix seconds → local "Aug 21, 02:37 PM"; '—' for a draw that hasn't happened. */
export function formatDrawDate(ts: number | null): string {
  if (!ts) return '—'
  const p = localParts(new Date(ts * 1000))
  return `${monthDay(p)}, ${clock12(p, { padHour: true, minutes: true })}`
}

/** Second-precision local draw time for the proof view: "Aug 21, 2026, 02:37:05 PM". */
export function formatRevealDate(ts: number | null): string {
  if (!ts) return '—'
  const p = localParts(new Date(ts * 1000))
  return `${monthDay(p)}, ${p.year}, ${clock12(p, { padHour: true, minutes: true, seconds: true })}`
}

/** Whole-dollar (or fixed-cents) USD with grouping, e.g. "$13,440". */
export function formatUsdFixed(value: number, decimals = 0): string {
  return numberFormat({
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatCount(value: number): string {
  return numberFormat().format(value)
}
