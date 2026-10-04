import { Pressable, StyleSheet, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { Txt } from '@/components/ui/txt'
import { colors, space } from '@/constants/theme'

/** "‹ 1–10 of 75 ›" footer for a client-paged list; renders nothing when everything fits on one page. */
export function Pager({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const start = page * pageSize
  return (
    <View style={styles.pager}>
      <PageButton icon="chevron-left" label="Previous page" disabled={page === 0} onPress={() => onChange(page - 1)} />
      <Txt style={styles.pageText}>
        {start + 1}–{Math.min(start + pageSize, total)} of {total}
      </Txt>
      <PageButton
        icon="chevron-right"
        label="Next page"
        disabled={page >= pages - 1}
        onPress={() => onChange(page + 1)}
      />
    </View>
  )
}

/** Clamps a stored page so a refresh that shrinks the list never leaves you past the end. */
export function clampPage(page: number, pageSize: number, total: number) {
  return Math.max(0, Math.min(page, Math.ceil(total / pageSize) - 1))
}

function PageButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right'
  label: string
  disabled: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.pageButton, pressed && styles.pagePressed, disabled && styles.pageDisabled]}
    >
      <Feather name={icon} size={16} color={colors.accent} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pager: {
    alignItems: 'center',
    borderTopColor: colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: space.xs,
    paddingTop: space.sm,
  },
  pageText: { color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  pageButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  pagePressed: { backgroundColor: 'rgba(96, 165, 250, 0.24)' },
  pageDisabled: { opacity: 0.35 },
})
