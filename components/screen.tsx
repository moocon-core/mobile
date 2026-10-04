import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppHeader } from '@/components/app-header'
import { FLOATING_TAB_BAR_SPACE } from '@/components/floating-tab-bar'
import { colors, space } from '@/constants/theme'

/** Tab screen chrome: glow backdrop, app header, scroll body with optional pull-to-refresh. */
export function Screen({
  children,
  onRefresh,
  header = <AppHeader />,
  footer,
}: PropsWithChildren<{ onRefresh?: () => Promise<unknown>; header?: ReactNode; footer?: ReactNode }>) {
  const [refreshing, setRefreshing] = useState(false)
  // A hairline under the header once content scrolls beneath it, so the cut-off edge reads as intentional.
  const [scrolled, setScrolled] = useState(false)

  async function handleRefresh() {
    if (!onRefresh) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.16)', 'rgba(56, 189, 248, 0.04)', 'transparent']}
        style={styles.glow}
        pointerEvents="none"
      />
      <SafeAreaView edges={['top']} style={styles.root}>
        <View style={[styles.header, scrolled && styles.headerScrolled]}>{header}</View>
        <ScrollView
          scrollEventThrottle={32}
          onScroll={(e) => {
            const next = e.nativeEvent.contentOffset.y > 4
            if (next !== scrolled) setScrolled(next)
          }}
          contentContainerStyle={[styles.content, footer ? styles.withFooter : null]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.accent}
                colors={[colors.primary]}
                progressBackgroundColor={colors.cardRaised}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        {footer}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  root: { flex: 1 },
  glow: { height: 360, left: 0, position: 'absolute', right: 0, top: 0 },
  header: { borderBottomColor: 'transparent', borderBottomWidth: StyleSheet.hairlineWidth },
  headerScrolled: { borderBottomColor: colors.hairline },
  withFooter: { paddingBottom: space.xxl },
  content: { paddingBottom: FLOATING_TAB_BAR_SPACE + space.xxl, paddingHorizontal: space.lg, paddingTop: space.lg },
})
