import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Skeleton } from '@/components/ui/skeleton'
import { Txt } from '@/components/ui/txt'
import { colors, radius, space } from '@/constants/theme'

export interface Stat {
  label: string
  value: string
  sub?: string | null
  accent?: boolean
  loading?: boolean
}

/** Glass tiles, up to 3 per row (2 per row beyond that), so every stat fits on screen. */
export function StatTiles({ stats }: { stats: Stat[] }) {
  const columns = stats.length <= 3 ? stats.length : 2
  const rows = Array.from({ length: Math.ceil(stats.length / columns) }, (_, r) =>
    stats.slice(r * columns, r * columns + columns),
  )
  return (
    <View style={styles.grid}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((s) => (
            <StatTile key={s.label} stat={s} />
          ))}
          {/* Keeps a short last row's tiles the same width as the rows above. */}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`pad-${i}`} style={styles.tileSlot} />
          ))}
        </View>
      ))}
    </View>
  )
}

function StatTile({ stat: s }: { stat: Stat }) {
  return (
    <LinearGradient
      colors={[s.accent ? 'rgba(129, 140, 248, 0.16)' : 'rgba(59, 130, 246, 0.14)', 'rgba(17, 24, 39, 0.55)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tileSlot, styles.tile]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.18)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <Txt style={styles.label} numberOfLines={1}>
        {s.label}
      </Txt>
      {s.loading ? (
        <Skeleton width={56} height={17} style={styles.skeleton} />
      ) : (
        <>
          <Txt style={[styles.value, s.accent && { color: colors.accentSoft }]} numberOfLines={1} adjustsFontSizeToFit>
            {s.value}
          </Txt>
          {s.sub ? (
            <Txt style={styles.sub} numberOfLines={1}>
              {s.sub}
            </Txt>
          ) : null}
        </>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  grid: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  tileSlot: { flex: 1 },
  tile: {
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  sheen: { height: 1, left: 0, position: 'absolute', right: 0, top: 0 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  value: {
    color: colors.title,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: space.sm,
  },
  sub: { color: colors.subtle, fontSize: 11, marginTop: 1 },
  skeleton: { marginTop: space.sm },
})
