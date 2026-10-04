import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radius } from '@/constants/theme'

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <View style={styles.root} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return
              Haptics.selectionAsync().catch(() => {})
              onChange(o.value)
            }}
            style={[styles.item, active && styles.active]}
          >
            <Text style={[styles.text, active && styles.activeText]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  item: { alignItems: 'center', borderRadius: radius.sm + 1, flex: 1, paddingVertical: 8 },
  active: { backgroundColor: colors.cardRaised },
  text: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  activeText: { color: colors.accent },
})
