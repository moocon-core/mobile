import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { colors, radius, space } from '@/constants/theme'

export function BackHeader({ children }: { children?: ReactNode }) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.back}
        hitSlop={8}
        accessibilityLabel="Back"
      >
        <Feather name="chevron-left" size={24} color={colors.foreground} />
      </Pressable>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  back: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  content: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: space.sm },
})
