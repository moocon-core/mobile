import type { Drawing, StatDataPoint, VaultAprHistoryPoint } from './api/types'
import { fmtAxisDate, fmtTooltipDate, type StatsInterval } from './stats'

export type WinnersMode = 'latest' | 'top'

/**
 * Settled draws, newest-first for 'latest' or by winner APR for 'top'. The
 * in-flight round has no winner yet and is dropped before ranking so it never
 * costs a visible row; unknown APRs sort last.
 */
export function rankSettledDrawings<T extends Drawing>(drawings: readonly T[], mode: WinnersMode, limit: number): T[] {
  const settled = drawings.filter((d) => d.revealed_at !== null)
  const ranked =
    mode === 'top'
      ? [...settled].sort(
          (a, b) =>
            (b.winner_apr_percent ?? Number.NEGATIVE_INFINITY) - (a.winner_apr_percent ?? Number.NEGATIVE_INFINITY)
        )
      : settled
  return ranked.slice(0, limit)
}

export interface ProofTxRow {
  label: string
  tx: string | null
  /** Lives on the MagicBlock ephemeral rollup, so Solscan needs the ER endpoint. */
  er: boolean
}

export function proofTxRows(d: Drawing): ProofTxRow[] {
  return [
    { label: 'Commit TX', tx: d.commit_tx, er: false },
    { label: 'Delegate TX', tx: d.delegate_tx, er: false },
    { label: 'Request Randomness (ER)', tx: d.request_randomness_er, er: true },
    { label: 'Undelegate (ER)', tx: d.reveal_undelegate_er, er: true },
    { label: 'Reveal', tx: d.reveal_tx, er: false }
  ]
}

export function proofDataRows(d: Drawing): { label: string; value: string | null }[] {
  return [
    { label: 'Merkle Root', value: d.merkle_root },
    { label: 'Secret Seed', value: d.secret_seed },
    { label: 'Secret Hash', value: d.secret_hash },
    { label: 'VRF Seed', value: d.vrf_seed },
    { label: 'Randomness', value: d.randomness }
  ]
}

export interface PrizeChartRow {
  label: string
  tooltipLabel: string
  prize: number
  /** Running mean of winner APR up to and including this round. */
  avgApr: number | null
  /** This round's own winner APR — tooltip only, too spiky to plot. */
  roundApr: number | null
}

export function vaultPrizeRows(history: readonly VaultAprHistoryPoint[], tokenDecimals: number): PrizeChartRow[] {
  return history.map((p) => ({
    label: `#${p.round}`,
    tooltipLabel:
      p.revealed_at == null ? `Round ${p.round}` : `Round ${p.round} · ${fmtTooltipDate(p.revealed_at, '1d')}`,
    prize: Number(p.amount) / 10 ** tokenDecimals,
    avgApr: p.average_apr_percent,
    roundApr: p.apr_percent
  }))
}

export interface TvlChartRow {
  label: string
  tooltipLabel: string
  tvl_usd: number
  total_rewards_usd: number
}

/** Oldest-first chart rows from `/api/stats` points (which arrive newest-first). */
export function statRows(points: readonly StatDataPoint[], interval: StatsInterval): TvlChartRow[] {
  return points
    .map((p) => ({
      label: fmtAxisDate(p.recorded_at, interval),
      tooltipLabel: fmtTooltipDate(p.recorded_at, interval),
      tvl_usd: p.tvl_usd,
      total_rewards_usd: p.total_rewards_usd
    }))
    .reverse()
}

/**
 * `statRows` for one vault. An API predating the per-vault series ignores the
 * vault filter and answers with protocol-wide totals, so only points that name
 * this vault are kept.
 */
export function vaultTvlRows(
  points: readonly StatDataPoint[],
  vault: string,
  interval: StatsInterval
): TvlChartRow[] {
  return statRows(
    points.filter((p) => p.vault === vault),
    interval
  )
}

/** The latest stat point only when it is scoped to this vault (see `vaultTvlRows`). */
export function latestVaultStat(points: readonly StatDataPoint[] | undefined, vault: string): StatDataPoint | null {
  const p = points?.[0]
  return p?.vault === vault ? p : null
}
