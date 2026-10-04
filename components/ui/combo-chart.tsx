import { useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native'
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { colors } from '@/constants/theme'

export interface ComboPoint {
  label: string
  bar: number
  /** null leaves the line flat at the previous value. */
  line: number | null
}

const MIN_LEFT = 44
// Approximate advance of a 10px axis digit; widens the left gutter for long labels like 0.000029.
const AXIS_CHAR_W = 6
const RIGHT = 44
const TOP = 8
const BOTTOM = 20
const SECTIONS = 4
const GRID = 'rgba(30, 58, 95, 0.5)'

// A null keeps the line flat at the previous value rather than dropping to zero.
function carryForward(values: (number | null)[]): number[] {
  const out: number[] = []
  for (const v of values) out.push(v ?? out.at(-1) ?? 0)
  return out
}

function niceMax(values: number[]) {
  const max = Math.max(0, ...values)
  return max === 0 ? 1 : max * 1.1
}

/** Bars on the left axis, a line on the right axis, one tap target per point. */
export function ComboChart({
  points,
  height = 180,
  barColor,
  lineColor,
  lineArea,
  formatLeft,
  formatRight,
  selected,
  onSelect,
  labelCount = 4,
}: {
  points: ComboPoint[]
  height?: number
  barColor: string
  lineColor: string
  /** Fill under the line (TVL); off for a running average. */
  lineArea?: boolean
  formatLeft: (v: number) => string
  formatRight: (v: number) => string
  selected: number | null
  onSelect: (index: number) => void
  labelCount?: number
}) {
  // Charts sit in a screen-padded card; estimate that width so the first frame already draws, onLayout corrects it.
  const window = useWindowDimensions()
  const [width, setWidth] = useState(() => Math.round(window.width - 2 * 16 - 2 * 17))
  const barMax = niceMax(points.map((p) => p.bar))
  const leftLabels = Array.from({ length: SECTIONS + 1 }, (_, s) => formatLeft(barMax * (1 - s / SECTIONS)))
  const left = Math.max(MIN_LEFT, Math.ceil(Math.max(...leftLabels.map((l) => l.length)) * AXIS_CHAR_W + 8))
  const plotW = Math.max(0, width - left - RIGHT)
  const plotH = height - TOP - BOTTOM
  const n = points.length
  const step = n > 0 ? plotW / n : 0
  const barW = Math.max(2, Math.min(18, step * 0.6))

  const lineValues = carryForward(points.map((p) => p.line))
  const lineMax = niceMax(lineValues)
  const x = (i: number) => left + step * i + step / 2
  const yBar = (v: number) => TOP + plotH - (v / barMax) * plotH
  const yLine = (v: number) => TOP + plotH - (v / lineMax) * plotH

  const linePath = lineValues.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yLine(v).toFixed(1)}`).join(' ')
  const areaPath =
    n > 0 ? `${linePath} L${x(n - 1).toFixed(1)},${TOP + plotH} L${x(0).toFixed(1)},${TOP + plotH} Z` : ''
  const labelEvery = Math.max(1, Math.ceil(n / labelCount))

  return (
    <View
      style={{ height }}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width)
        if (w !== width) setWidth(w)
      }}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="comboArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity={0.24} />
              <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {Array.from({ length: SECTIONS + 1 }).map((_, s) => {
            const y = TOP + (plotH / SECTIONS) * s
            const frac = 1 - s / SECTIONS
            return (
              <G key={s}>
                <Line x1={left} x2={left + plotW} y1={y} y2={y} stroke={GRID} strokeDasharray="3 3" />
                <SvgText x={left - 6} y={y + 3} fontSize={10} fill={colors.accent} textAnchor="end">
                  {leftLabels[s]}
                </SvgText>
                <SvgText x={left + plotW + 6} y={y + 3} fontSize={10} fill={colors.accent} textAnchor="start">
                  {formatRight(lineMax * frac)}
                </SvgText>
              </G>
            )
          })}
          {points.map((p, i) => (
            <Rect
              key={i}
              x={x(i) - barW / 2}
              y={yBar(p.bar)}
              width={barW}
              height={Math.max(0, TOP + plotH - yBar(p.bar))}
              rx={1.5}
              fill={i === selected ? colors.title : barColor}
              opacity={i === selected ? 1 : 0.8}
            />
          ))}
          {lineArea && n > 1 ? <Path d={areaPath} fill="url(#comboArea)" /> : null}
          {n > 1 ? <Path d={linePath} stroke={lineColor} strokeWidth={2} fill="none" strokeLinejoin="round" /> : null}
          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <SvgText key={`l${i}`} x={x(i)} y={height - 4} fontSize={9} fill={colors.muted} textAnchor="middle">
                {p.label}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : null}
      <View style={[StyleSheet.absoluteFill, styles.hits, { left, right: RIGHT }]}>
        {points.map((p, i) => (
          <Pressable key={i} style={styles.hit} onPress={() => onSelect(i)} accessibilityLabel={p.label} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  hits: { flexDirection: 'row' },
  hit: { flex: 1 },
})
