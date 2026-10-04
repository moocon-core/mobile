import { StyleSheet, View, type TextStyle } from 'react-native'
import type { ResolvedPayout } from '@moocon/shared'
import { TokenIcon } from '@/components/ui/token-icon'
import { Txt } from '@/components/ui/txt'

// Swapped prizes show their original vault-token amount on a second line (no hover on touch).
export function PayoutAmount({
  payout,
  size = 20,
  textStyle,
  showSymbol,
  showSwapNote,
}: {
  payout: ResolvedPayout
  size?: number
  textStyle?: TextStyle
  /** Vault-token payouts omit the symbol by default, like the web table. */
  showSymbol?: boolean
  showSwapNote?: boolean
}) {
  return (
    <View>
      <View style={styles.row}>
        {payout.icon ? <TokenIcon uri={payout.icon} size={size} /> : null}
        <Txt style={textStyle}>
          {payout.text}
          {(showSymbol || payout.swapped) && payout.symbol ? ` ${payout.symbol}` : ''}
        </Txt>
      </View>
      {showSwapNote && payout.title ? <Txt variant="small">{payout.title}</Txt> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 6 },
})
