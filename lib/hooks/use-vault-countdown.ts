import { useIsFocused } from 'expo-router'
import { formatMMSS, formatVerbose, nextDrawAt, type VaultWithAddress } from '@moocon/shared'
import { useNowSeconds } from '@/lib/hooks/use-now'

type Tier = VaultWithAddress['distributionTiers'][number]

// Off-screen tabs and screens under a pushed route stop ticking.
export function useVaultCountdown(distributionTiers: readonly Tier[], format: 'verbose' | 'mmss' = 'verbose'): string {
  const nowSeconds = useNowSeconds(useIsFocused())
  const now = BigInt(nowSeconds)
  const soonest = nextDrawAt(distributionTiers, now)
  if (soonest === null) return '—'
  const remaining = Number(soonest - now)
  if (remaining <= 0) return format === 'mmss' ? '00:00' : '0s'
  return format === 'mmss' ? formatMMSS(remaining) : formatVerbose(remaining)
}
