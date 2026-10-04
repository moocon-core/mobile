import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { rankSettledDrawings, tierLabel, type Drawing, type WinnersMode } from '@moocon/shared'
import { DrawRow } from '@/components/draw-row'
import { Card } from '@/components/ui/card'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Txt } from '@/components/ui/txt'
import { space } from '@/constants/theme'

const MODES = [
  { label: 'Big Winners', value: 'top' },
  { label: 'Latest', value: 'latest' },
] as const

/** Web's draws table as a tappable list: each row opens its proof. */
export function VaultDrawsList({
  drawings,
  tierIntervals,
  isLoading,
  limit,
  onSelect,
}: {
  drawings: Drawing[]
  /** Tier intervals from the vault, indexed by reward_type. */
  tierIntervals: readonly bigint[]
  isLoading: boolean
  limit: number
  onSelect: (d: Drawing) => void
}) {
  const [mode, setMode] = useState<WinnersMode>('top')
  const settled = rankSettledDrawings(drawings, mode, limit)
  // A label repeated on every row is noise; only show it when the list mixes tiers.
  const mixedTiers = new Set(settled.map((d) => d.reward_type)).size > 1

  return (
    <View style={styles.root}>
      <SegmentedControl options={MODES} value={mode} onChange={setMode} />
      <Card style={styles.card}>
        {isLoading && settled.length === 0 ? (
          [0, 1, 2, 3].map((k) => <Skeleton key={k} height={44} style={styles.skeleton} />)
        ) : settled.length === 0 ? (
          <Txt variant="small" style={styles.empty}>
            No settled draws for this vault yet.
          </Txt>
        ) : (
          settled.map((d, i) => {
            const interval = tierIntervals[d.reward_type]
            return (
              <DrawRow
                key={d.id}
                drawing={d}
                divider={i > 0}
                onPress={() => onSelect(d)}
                title={
                  <>
                    <Txt style={styles.round}>#{d.round}</Txt>
                    {mixedTiers ? (
                      <Txt variant="label">
                        {interval != null && interval > 0n ? tierLabel(interval) : `Tier ${d.reward_type}`}
                      </Txt>
                    ) : null}
                  </>
                }
              />
            )
          })
        )}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  card: { paddingVertical: space.xs },
  skeleton: { marginVertical: space.sm },
  empty: { paddingVertical: space.xl, textAlign: 'center' },
  round: { fontFamily: 'SpaceMono', fontSize: 13 },
})
