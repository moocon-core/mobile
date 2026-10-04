import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { formatUsdCompact, formatUsdValue, statRows, usdAxisNeedsCents, type StatsInterval } from '@moocon/shared'
import { ComboChart } from '@/components/ui/combo-chart'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'
import { useStats } from '@/lib/queries/use-stats'

const INTERVALS = [
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
] as const

const BAR = '#38BDF8'
const LINE = '#3B82F6'
const MAX_POINTS = 30
const CHART_HEIGHT = 150

export function StatsChart() {
  const [interval, setInterval] = useState<StatsInterval>('1h')
  const [selected, setSelected] = useState<number | null>(null)
  const { data, isLoading, isPlaceholderData } = useStats({ interval, limit: 200 })

  // While the new interval loads, the old series stays up; label it with the interval it was fetched for.
  const [dataInterval, setDataInterval] = useState(interval)
  if (data && !isPlaceholderData && dataInterval !== interval) setDataInterval(interval)
  const rows = statRows(data?.data ?? [], dataInterval).slice(-MAX_POINTS)
  const rewardCents = usdAxisNeedsCents(Math.max(0, ...rows.map((r) => r.total_rewards_usd)))
  const tvlCents = usdAxisNeedsCents(Math.max(0, ...rows.map((r) => r.tvl_usd)))
  const inspected = selected != null ? rows[selected] : rows.at(-1)

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.legend}>
          <Legend color={LINE} shape="line" label="TVL" value={inspected ? formatUsdValue(inspected.tvl_usd) : null} />
          <Legend
            color={BAR}
            shape="bar"
            label="Rewards"
            value={inspected ? formatUsdValue(inspected.total_rewards_usd) : null}
          />
        </View>
        <View style={styles.intervals}>
          <SegmentedControl
            options={INTERVALS}
            value={interval}
            onChange={(i) => {
              setSelected(null)
              setInterval(i)
            }}
          />
        </View>
      </View>
      {isLoading ? (
        <Skeleton height={CHART_HEIGHT} />
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Txt variant="small">No data yet.</Txt>
        </View>
      ) : (
        <View style={isPlaceholderData && styles.stale}>
          <ComboChart
            points={rows.map((r) => ({ label: r.label, bar: r.total_rewards_usd, line: r.tvl_usd }))}
            height={CHART_HEIGHT}
            barColor={BAR}
            lineColor={LINE}
            lineArea
            formatLeft={(v) => formatUsdCompact(v, rewardCents)}
            formatRight={(v) => formatUsdCompact(v, tvlCents)}
            selected={selected}
            onSelect={setSelected}
            labelCount={3}
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
  value: string | null
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[shape === 'bar' ? styles.swatchBar : styles.swatchLine, { backgroundColor: color }]} />
      <Txt style={styles.legendText}>{label}</Txt>
      {value ? <Txt style={styles.legendValue}>{value}</Txt> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  header: { alignItems: 'center', flexDirection: 'row', gap: space.sm, justifyContent: 'space-between' },
  legend: { flexShrink: 1, gap: 4 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendText: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  legendValue: { color: colors.title, fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '700' },
  intervals: { width: 132 },
  swatchBar: { borderRadius: 2, height: 10, marginHorizontal: 3, opacity: 0.8, width: 10 },
  swatchLine: { borderRadius: 1, height: 2, width: 16 },
  empty: { alignItems: 'center', height: 180, justifyContent: 'center' },
  stale: { opacity: 0.45 },
})
