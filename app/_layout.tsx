import { PortalHost } from '@rn-primitives/portal'
import { useFonts } from 'expo-font'
import Feather from '@expo/vector-icons/Feather'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { colors } from '@/constants/theme'
import { useMintData } from '@/lib/mint-store'
import { useCallback } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { LogBox, View } from 'react-native'
import { ToastHost } from '@/components/ui/toast-host'
import { AppSplashController } from '@/components/app-splash-controller'

SplashScreen.preventAutoHideAsync()
// web3.js logs every dropped subscription socket (e.g. while the wallet app is in front) and reconnects itself.
LogBox.ignoreLogs(['ws error'])

export default function RootLayout() {
  // Icon fonts load here too so the tab bar and buttons never flash empty glyphs.
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...Feather.font,
  })

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync()
    }
  }, [loaded])
  if (!loaded) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppProviders>
          <AppSplashController />
          <RootNavigator />
          <StatusBar style="light" />
          <ToastHost />
        </AppProviders>
        <PortalHost />
      </View>
    </SafeAreaProvider>
  )
}

function RootNavigator() {
  useMintData()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}
