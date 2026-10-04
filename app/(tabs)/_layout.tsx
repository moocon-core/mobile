import { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { BlurTargetView } from 'expo-blur'
import { Tabs } from 'expo-router'
import { FloatingTabBar } from '@/components/floating-tab-bar'

export default function TabLayout() {
  // The bar blurs what is behind it, so it lives outside the blur target rather than in `tabBar`.
  const blurTarget = useRef<View>(null)
  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTarget} style={styles.root}>
        <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
          <Tabs.Screen name="index" options={{ title: 'Vaults' }} />
          <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
          <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
        </Tabs>
      </BlurTargetView>
      <FloatingTabBar blurTarget={blurTarget} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
