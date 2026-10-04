import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { formatUsdFixed, type Drawing } from '@moocon/shared'
import { RewardsList } from '@/components/analytics/rewards-list'
import { StatsChart } from '@/components/analytics/stats-chart'
import { ProofSheet } from '@/components/proof-sheet'
import { Screen } from '@/components/screen'
import { StatTiles } from '@/components/stat-tiles'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { SectionHeading } from '@/components/ui/txt'
import { radius, space } from '@/constants/theme'
import { useStats } from '@/lib/queries/use-stats'

export default function AnalyticsScreen() {
  const queryClient = useQueryClient()
  const [proof, setProof] = useState<Drawing | null>(null)
  const { data, isLoading } = useStats({ interval: '1d', limit: 1 })
  const latest = data?.data[0]

  return (
    <Screen
      onRefresh={() =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['stats'] }),
          queryClient.invalidateQueries({ queryKey: ['drawings'] }),
        ])
      }
    >
      <SectionHeading eyebrow="Analytics" title="Protocol Stats" />
      <View style={styles.section}>
        <StatTiles
          stats={[
            {
              label: 'TVL',

              value: latest ? formatUsdFixed(latest.tvl_usd) : '—',
              loading: isLoading,
            },
            {
              label: 'Rewards',
              value: latest ? formatUsdFixed(latest.total_rewards_usd, 2) : '—',
              accent: true,
              loading: isLoading,
            },
          ]}
        />
      </View>
      <Card style={[styles.section, styles.chartCard]}>
        <StatsChart />
      </Card>

      <Divider />

      <SectionHeading eyebrow="Live Draws" title="Who's Milking" level="h2" />
      <View style={styles.section}>
        <RewardsList onSelect={setProof} />
      </View>
      <ProofSheet drawing={proof} onClose={() => setProof(null)} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: space.lg },
  // Matches the stat tiles above.
  chartCard: { borderColor: 'rgba(148, 163, 184, 0.12)', borderRadius: radius.lg, padding: space.md },
})
