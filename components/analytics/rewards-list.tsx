import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { shortKey, type Drawing, type WinnersMode } from '@moocon/shared'
import { DrawRow } from '@/components/draw-row'
import { Card } from '@/components/ui/card'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { clampPage, Pager } from '@/components/ui/pager'
import { Skeleton } from '@/components/ui/skeleton'
import { Txt } from '@/components/ui/txt'
import { space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'
import { useDrawings, useTopDrawings } from '@/lib/queries/use-drawings'

const MODES = [
  { label: 'Big Winners', value: 'top' },
  { label: 'Latest', value: 'latest' },
] as const

const LIMIT = 50
const PAGE_SIZE = 10

export function RewardsList({ onSelect }: { onSelect: (d: Drawing) => void }) {
  const [mode, setMode] = useState<WinnersMode>('top')
  const [page, setPage] = useState(0)
  const { data, isLoading: latestLoading } = useDrawings(1, LIMIT)
  const { data: topData, isLoading: topLoading } = useTopDrawings(LIMIT)
  const getMint = useMintStore((s) => s.getMint)
  const isLoading = mode === 'top' ? topLoading : latestLoading
  const drawings = (mode === 'top' ? topData?.drawings : data?.drawings) ?? []
  const current = clampPage(page, PAGE_SIZE, drawings.length)

  return (
    <View style={styles.root}>
      <SegmentedControl
        options={MODES}
        value={mode}
        onChange={(m) => {
          setPage(0)
          setMode(m)
        }}
      />
      <Card style={styles.card}>
        {isLoading ? (
          [0, 1, 2, 3, 4].map((k) => <Skeleton key={k} height={44} style={styles.skeleton} />)
        ) : drawings.length === 0 ? (
          <Txt variant="small" style={styles.empty}>
            No rewards yet.
          </Txt>
        ) : (
          drawings.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE).map((d, i) => {
            const mint = d.mint ? getMint(d.mint) : undefined
            return (
              <DrawRow
                key={d.id}
                drawing={d}
                divider={i > 0}
                onPress={() => onSelect(d)}
                title={
                  <>
                    <Txt style={styles.vault}>{mint?.symbol ?? shortKey(d.vault)}</Txt>
                    <Txt variant="small">#{d.round}</Txt>
                  </>
                }
              />
            )
          })
        )}
        <Pager page={current} pageSize={PAGE_SIZE} total={drawings.length} onChange={setPage} />
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  card: { paddingVertical: space.xs },
  skeleton: { marginVertical: space.sm },
  empty: { paddingVertical: space.xl, textAlign: 'center' },
  vault: { fontSize: 14, fontWeight: '700' },
})
