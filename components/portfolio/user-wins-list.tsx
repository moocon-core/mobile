import { useState } from 'react'
import { StyleSheet } from 'react-native'
import type { PublicKey } from '@solana/web3.js'
import { formatPrizeUsd, shortKey, type Drawing } from '@moocon/shared'
import { DrawRow } from '@/components/draw-row'
import { Card } from '@/components/ui/card'
import { clampPage, Pager } from '@/components/ui/pager'
import { SectionHeading, Txt } from '@/components/ui/txt'
import { Divider } from '@/components/ui/divider'
import { space } from '@/constants/theme'
import { useMintStore } from '@/lib/mint-store'
import { useWalletWins } from '@/lib/queries/use-drawings'

const PAGE_SIZE = 10

export function UserWinsList({ owner, onSelect }: { owner: PublicKey; onSelect: (d: Drawing) => void }) {
  const { data } = useWalletWins(owner.toBase58())
  const getMint = useMintStore((s) => s.getMint)
  const wins = data?.wins ?? []
  const [page, setPage] = useState(0)
  if (wins.length === 0) return null
  const current = clampPage(page, PAGE_SIZE, wins.length)
  const visible = wins.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  return (
    <>
      <Divider />
      <SectionHeading eyebrow="Winnings" title="What You've Milked" level="h2" />
      <Card style={styles.card}>
        {visible.map((w, i) => {
          const meta = w.mint ? getMint(w.mint) : undefined
          return (
            <DrawRow
              key={w.id}
              drawing={w}
              divider={i > 0}
              onPress={() => onSelect(w)}
              showWinner={false}
              title={
                <>
                  <Txt style={styles.vault}>{meta?.symbol ?? shortKey(w.vault)}</Txt>
                  <Txt style={styles.usd}>{formatPrizeUsd(w.amount_usd)}</Txt>
                </>
              }
            />
          )
        })}
        <Pager page={current} pageSize={PAGE_SIZE} total={wins.length} onChange={setPage} />
      </Card>
    </>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: space.lg, paddingVertical: space.xs },
  vault: { fontSize: 14, fontWeight: '700' },
  usd: { fontSize: 13, fontWeight: '600' },
})
