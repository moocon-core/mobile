import { clock12, clock24, monthDay, utcParts } from './dates'
import { STATS_INTERVALS } from './sdk'

export type StatsInterval = '1h' | '4h' | '1d'

/**
 * Snap a sample to the start of the bucket the API grouped it into.
 *
 * `/api/stats` buckets on `(recorded_at / intervalSec) * intervalSec` but
 * returns `MAX(recorded_at)` from inside the bucket — the last 5-minute cron
 * snapshot, not the boundary. Labelling that raw value makes consecutive ticks
 * drift with cron jitter, so name the bucket instead.
 */
export function bucketStart(ts: number, interval: StatsInterval): number {
  return Math.floor(ts / STATS_INTERVALS[interval]) * STATS_INTERVALS[interval]
}

// Buckets are cut on UTC boundaries, so labels are UTC too — a local-time label can name the wrong day.
function bucketParts(ts: number, interval: StatsInterval) {
  return utcParts(new Date(bucketStart(ts, interval) * 1000))
}

/**
 * Axis tick: "Aug 21" for daily buckets, "Aug 21, 2 PM" otherwise. No " at ": the
 * label width decides the tick count.
 */
export function fmtAxisDate(ts: number, interval: StatsInterval): string {
  const p = bucketParts(ts, interval)
  if (interval === '1d') return monthDay(p)
  return `${monthDay(p)}, ${clock12(p, { padHour: false, minutes: false })}`
}

/** Tooltip: same instant, minute precision, and explicit about the zone. */
export function fmtTooltipDate(ts: number, interval: StatsInterval): string {
  const p = bucketParts(ts, interval)
  if (interval === '1d') return `${monthDay(p)} UTC`
  return `${monthDay(p)}, ${clock24(p)} UTC`
}
