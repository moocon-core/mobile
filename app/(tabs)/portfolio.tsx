import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { sanitizeReferralCode, type Drawing } from '@moocon/shared'
import { ReferralPanel } from '@/components/portfolio/referral-panel'
import { UserPositionsList } from '@/components/portfolio/user-positions-list'
import { UserStatsPanel } from '@/components/portfolio/user-stats-panel'
import { UserWinsList } from '@/components/portfolio/user-wins-list'
import { ProofSheet } from '@/components/proof-sheet'
import { Screen } from '@/components/screen'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { SectionHeading, Txt } from '@/components/ui/txt'
import { WalletButton } from '@/components/wallet-button'
import { space } from '@/constants/theme'
import { useAllVaults } from '@/lib/queries/use-vaults'
import { useWalletAddress } from '@/lib/wallet'

export default function PortfolioScreen() {
  const owner = useWalletAddress()
  // Shared links open moocon://portfolio?ref=CODE, like the web's /portfolio?ref=CODE.
  const { ref } = useLocalSearchParams<{ ref?: string }>()
  const { data: vaults = [] } = useAllVaults()
  const queryClient = useQueryClient()
  const [proof, setProof] = useState<Drawing | null>(null)

  return (
    <Screen
      onRefresh={
        owner
          ? () =>
              Promise.all([
                queryClient.invalidateQueries({ queryKey: ['user'] }),
                queryClient.invalidateQueries({ queryKey: ['rewards'] }),
                queryClient.invalidateQueries({ queryKey: ['drawings'] }),
                queryClient.invalidateQueries({ queryKey: ['referrals'] }),
              ])
          : undefined
      }
    >
      <SectionHeading eyebrow="Dashboard" title="Portfolio" />
      {!owner ? (
        <Card style={styles.connect}>
          <Txt variant="h3">Connect your wallet</Txt>
          <Txt variant="small" style={styles.center}>
            See your deposits, winnings, claimable rewards and referral code.
          </Txt>
          <WalletButton />
        </Card>
      ) : (
        <>
          <View style={styles.section}>
            <UserStatsPanel owner={owner} vaults={vaults} />
          </View>

          <Divider />
          <SectionHeading eyebrow="Positions" title="Where You're Staked" level="h2" />
          <View style={styles.section}>
            <UserPositionsList owner={owner} vaults={vaults} />
          </View>
          <View style={styles.section}>
            <ReferralPanel key={ref ?? ''} owner={owner} initialCode={sanitizeReferralCode(ref ?? '')} />
          </View>

          <UserWinsList owner={owner} onSelect={setProof} />
        </>
      )}
      <ProofSheet drawing={proof} onClose={() => setProof(null)} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: space.lg },
  connect: { alignItems: 'center', gap: space.md, marginTop: space.xl, paddingVertical: space.xxl },
  center: { textAlign: 'center' },
})
