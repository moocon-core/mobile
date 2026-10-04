import { Image } from 'expo-image'
import { View } from 'react-native'
import { colors } from '@/constants/theme'

// memory-disk: a remounted screen shows cached icons on its first frame instead of re-decoding from disk.
export function TokenIcon({ uri, size = 24 }: { uri?: string | null; size?: number }) {
  const shape = { borderRadius: size / 2, height: size, width: size }
  if (!uri) return <View style={[shape, { backgroundColor: colors.cardRaised }]} />
  return (
    <Image
      source={{ uri }}
      style={[shape, { backgroundColor: colors.cardRaised }]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={120}
    />
  )
}
