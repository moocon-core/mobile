import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  formatUsdCompact,
  formatUsdValue,
  numberFormat,
  usdAxisNeedsCents,
  vaultPrizeRows,
  vaultTvlRows,
  type StatsInterval,
  type VaultAprHistoryPoint,
} from '@moocon/shared'
import { ComboChart } from '@/components/ui/combo-chart'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'
import { useStats } from '@/lib/queries/use-stats'

type Mode = 'prizes' | 'tvl'

const MODES = [
  { label: 'Prizes', value: 'prizes' },
  { label: 'TVL', value: 'tvl' },
] as const
const INTERVALS = [
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
] as const

const BAR = '#38BDF8'
const LINE_PRIZE = '#818CF8'
const LINE_TVL = '#3B82F6'
// Readable bar density on a phone; the avg APR line is the API's whole-life running mean regardless.
const MAX_POINTS = 30
const CHART_HEIGHT = 150

interface Row {
  label: string
  bar: number
  line: number | null
  /** Legend readouts for the inspected point: bar first, then line. */
  values: [string, string]
}

export function VaultHistoryChart({
  vaultAddress,
  tokenName,
  tokenDecimals,
  history,
  historyLoading,
}: {
  vaultAddress: string
  tokenName: string
  tokenDecimals: number
  history: VaultAprHistoryPoint[]
  historyLoading: boolean
}) {
  // Per-vault TVL only accumulates from the first snapshot, so prizes is the default.
  const [mode, setMode] = useState<Mode>('prizes')
  const [interval, setInterval] = useState<StatsInterval>('1h')
  const [selected, setSelected] = useState<number | null>(null)
  const {
    data: stats,
    isLoading: statsLoading,
    isPlaceholderData,
  } = useStats({ interval, limit: 200, vault: vaultAddress })

  // While the new interval loads, the old series stays up; label it with the interval it was fetched for.
  const [dataInterval, setDataInterval] = useState(interval)
  if (stats && !isPlaceholderData && dataInterval !== interval) setDataInterval(interval)
  const isPrizes = mode === 'prizes'
  const rows: Row[] = isPrizes
    ? vaultPrizeRows(history.slice(-MAX_POINTS), tokenDecimals).map((r) => ({
        label: r.label,
        bar: r.prize,
        line: r.avgApr,
        values: [
          `${numberFormat({ maximumFractionDigits: tokenDecimals }).format(r.prize)} ${tokenName}`,
          r.avgApr == null ? '—' : `${r.avgApr.toFixed(2)}%`,
        ],
      }))
    : vaultTvlRows(stats?.data ?? [], vaultAddress, dataInterval)
        .slice(-MAX_POINTS)
        .map((r) => ({
          label: r.label,
          bar: r.total_rewards_usd,
          line: r.tvl_usd,
          values: [formatUsdValue(r.total_rewards_usd), formatUsdValue(r.tvl_usd)],
        }))

  const barCents = usdAxisNeedsCents(Math.max(0, ...rows.map((r) => r.bar)))
  const lineCents = usdAxisNeedsCents(Math.max(0, ...rows.map((r) => r.line ?? 0)))
  const inspected = selected != null ? rows[selected] : rows.at(-1)

  function switchTo(next: () => void) {
    setSelected(null)
    next()
  }

  return (
    <View style={styles.root}>
      <View style={styles.controls}>
        <View style={styles.modes}>
          <SegmentedControl options={MODES} value={mode} onChange={(m) => switchTo(() => setMode(m))} />
        </View>
        {isPrizes ? (
          history.length > MAX_POINTS ? (
            <Txt style={styles.note}>Last {MAX_POINTS} rounds</Txt>
          ) : null
        ) : (
          <View style={styles.intervals}>
            <SegmentedControl options={INTERVALS} value={interval} onChange={(i) => switchTo(() => setInterval(i))} />
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <Legend color={BAR} shape="bar" label={isPrizes ? 'Prize' : 'Rewards'} value={inspected?.values[0]} />
        <Legend
          color={isPrizes ? LINE_PRIZE : LINE_TVL}
          shape="line"
          label={isPrizes ? 'Avg APR' : 'TVL'}
          value={inspected?.values[1]}
        />
      </View>

      {rows.length === 0 && (isPrizes ? historyLoading : statsLoading) ? (
        <Skeleton height={CHART_HEIGHT} />
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Txt variant="small" style={styles.emptyText}>
            {isPrizes
              ? 'No settled rounds for this vault yet.'
              : 'Collecting data — the per-vault TVL series starts from the first snapshot and cannot be backfilled.'}
          </Txt>
        </View>
      ) : (
        <View style={!isPrizes && isPlaceholderData && styles.stale}>
          <ComboChart
            points={rows}
            height={CHART_HEIGHT}
            barColor={BAR}
            lineColor={isPrizes ? LINE_PRIZE : LINE_TVL}
            lineArea={!isPrizes}
            formatLeft={(v) =>
              isPrizes
                ? // Significant digits, not decimals: SOL-sized prizes (~0.00003) would all round to 0.
                  numberFormat({ maximumSignificantDigits: 2, notation: 'compact' }).format(v)
                : formatUsdCompact(v, barCents)
            }
            formatRight={(v) => (isPrizes ? `${v.toFixed(0)}%` : formatUsdCompact(v, lineCents))}
            selected={selected}
            onSelect={setSelected}
          />
        </View>
      )}
    </View>
  )
}
function Legend({
  color,
  shape,
  label,
  value,
}: {
  color: string
  shape: 'bar' | 'line'
  label: string
  value: string | undefined
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[shape === 'bar' ? styles.swatchBar : styles.swatchLine, { backgroundColor: color }]} />
      <Txt style={styles.legendText}>{label}</Txt>
      {value ? (
        <Txt style={styles.legendValue} numberOfLines={1}>
          {value}
        </Txt>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  controls: { alignItems: 'center', flexDirection: 'row', gap: space.sm, justifyContent: 'space-between' },
  modes: { width: 150 },
  intervals: { width: 132 },
  note: { color: colors.subtle, fontSize: 11 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg, rowGap: 4 },
  legendItem: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 6 },
  legendText: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  legendValue: { color: colors.title, flexShrink: 1, fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '700' },
  swatchBar: { borderRadius: 2, height: 10, marginHorizontal: 3, opacity: 0.8, width: 10 },
  swatchLine: { borderRadius: 1, height: 2, width: 16 },
  empty: {
    alignItems: 'center',
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: CHART_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  emptyText: { textAlign: 'center' },
  stale: { opacity: 0.45 },
})
