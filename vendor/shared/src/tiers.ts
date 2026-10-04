import type { DistributionTier } from './sdk'

// Fast draws (< 1 day) are "Bull Sprint", big slow draws are "Golden Horn";
// the actual cadence stays visible as a suffix.
export function tierLabel(seconds: bigint): string {
  const s = Number(seconds)
  const cadence =
    s % 86_400 === 0
      ? `${s / 86_400}d`
      : s % 3_600 === 0
        ? `${s / 3_600}h`
        : `${Math.max(1, Math.round(s / 60))}m`
  const name = s >= 86_400 ? 'Golden Horn' : 'Bull Sprint'
  return `${name} · ${cadence}`
}

export function activeTierIndexes(tiers: readonly DistributionTier[]): number[] {
  return tiers.flatMap((tier, i) =>
    tier.interval > 0n && tier.rewardShare > 0n ? [i] : []
  )
}

// Unix seconds of the soonest upcoming draw across active tiers, or null when
// no tier is active. A tier that never drew counts from `now`.
export function nextDrawAt(
  tiers: readonly DistributionTier[],
  now: bigint
): bigint | null {
  const tier = soonestTier(tiers, now)
  if (!tier) return null
  return tier.distributedAt > 0n ? tier.distributedAt + tier.interval : now + tier.interval
}

// Total-minutes:seconds, both zero-padded to at least two digits (e.g. "05:09",
// "120:00"). Minutes are not wrapped into hours/days so the value stays MM:SS.
export function formatMMSS(remaining: number): string {
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatVerbose(remaining: number): string {
  const d = Math.floor(remaining / 86_400)
  const h = Math.floor((remaining % 86_400) / 3_600)
  const m = Math.floor((remaining % 3_600) / 60)
  const s = remaining % 60
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (d > 0 || h > 0) parts.push(`${h}h`)
  if (d > 0 || h > 0 || m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

// Character slots to reserve for the countdown so a row never reflows as digits
// change (e.g. "3m 10s" -> "3m 9s"). Sized to the widest string this tier's
// interval can reach; the countdown is left-anchored into the slot.
export function countdownSlotCh(intervalSeconds: bigint): number {
  const s = Number(intervalSeconds)
  if (s >= 86_400) return String(Math.floor(s / 86_400)).length + 13 // "Nd 23h 59m 59s"
  if (s >= 3_600) return 11 // "23h 59m 59s"
  if (s >= 60) return 7 // "59m 59s"
  return 3 // "59s"
}

// Slot width for the MM:SS format: minutes (>= 2 digits) plus ":SS".
export function countdownSlotChMMSS(intervalSeconds: bigint): number {
  const minutes = Math.floor(Number(intervalSeconds) / 60)
  return Math.max(String(minutes).length, 2) + 3
}

// The active tier that fires next — the one a single countdown for the vault shows.
export function soonestTier(
  tiers: readonly DistributionTier[],
  now: bigint
): DistributionTier | null {
  let soonest: { tier: DistributionTier; next: bigint } | null = null
  for (const tier of tiers) {
    if (tier.interval <= 0n || tier.rewardShare <= 0n) continue
    const next = tier.distributedAt > 0n ? tier.distributedAt + tier.interval : now + tier.interval
    if (soonest === null || next < soonest.next) soonest = { tier, next }
  }
  return soonest?.tier ?? null
}
