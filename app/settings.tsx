import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { Stack } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { SettingsUiCluster } from '@/components/settings/settings-ui-cluster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WalletButton } from '@/components/wallet-button'
import { useWalletAddress } from '@/lib/wallet'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'

const LINKS = [
  { label: 'X', url: 'https://x.com/moocon_' },
  { label: 'Docs', url: 'https://docs.moocon.xyz/' },
  { label: 'Built on Jupiter Lend', url: 'https://jup.ag/lend' },
]

export default function SettingsScreen() {
  const owner = useWalletAddress()
  const { disconnect } = useMobileWallet()
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Settings' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.account}>
          <Txt variant="label">Wallet</Txt>
          {owner ? (
            <>
              <Txt selectable style={styles.address}>
                {owner.toBase58()}
              </Txt>
              <Button label="Disconnect" variant="ghost" onPress={() => disconnect().catch(() => {})} />
            </>
          ) : (
            <View style={styles.connect}>
              <Txt variant="small">No wallet connected.</Txt>
              <WalletButton />
            </View>
          )}
        </Card>
        {/* The API only serves mainnet, so switching clusters is a developer tool. */}
        {__DEV__ ? (
          <Card>
            <SettingsUiCluster />
          </Card>
        ) : null}
        <Card style={styles.links}>
          {LINKS.map((l) => (
            <Pressable key={l.url} style={styles.link} onPress={() => Linking.openURL(l.url).catch(() => {})}>
              <Txt>{l.label}</Txt>
              <Feather name="external-link" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  content: { gap: space.lg, padding: space.lg },
  links: { paddingVertical: space.sm },
  account: { gap: space.md },
  address: { fontFamily: 'SpaceMono', fontSize: 12 },
  connect: { alignItems: 'flex-start', gap: space.md },
  link: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.md },
})
