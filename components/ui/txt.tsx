import { Text, type TextProps } from 'react-native'
import { colors, type } from '@/constants/theme'

export type TxtVariant = keyof typeof type

export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: TxtVariant }) {
  return <Text style={[{ color: colors.foreground }, type[variant], style]} {...rest} />
}

// Section titles sit above compact tiles, so they run a step smaller than the base type scale.
const HEADING_SIZE = { title: 22, h2: 18 } as const

export function SectionHeading({
  eyebrow,
  title,
  level = 'title',
}: {
  eyebrow: string
  title: string
  level?: 'title' | 'h2'
}) {
  return (
    <>
      <Txt variant="eyebrow">{eyebrow}</Txt>
      <Txt variant={level} style={{ fontSize: HEADING_SIZE[level], marginTop: 4 }}>
        {title}
      </Txt>
    </>
  )
}
