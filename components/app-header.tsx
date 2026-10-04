import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'
import { Txt } from '@/components/ui/txt'
import { WalletButton } from '@/components/wallet-button'
import { space } from '@/constants/theme'

export function AppHeader() {
  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <Image source={require('../assets/images/moocon-mark.png')} style={styles.logo} contentFit="contain" />
        <Txt variant="h3" style={styles.brandText}>
          MOOCON
        </Txt>
      </View>
      <WalletButton />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  brand: { alignItems: 'center', flexDirection: 'row', gap: space.sm },
  logo: { height: 36, width: 36 },
  brandText: { fontWeight: '900', letterSpacing: -0.5 },
})
