import type { PublicKey } from '@solana/web3.js'

// Parsed account types, kept free of runtime imports so consumers (e.g.
// @moocon/shared) can reference them without type-checking the whole SDK.
export type VaultAccount = {
  mint: PublicKey
  fMint: PublicKey
  pMint: PublicKey
  lending: PublicKey

  minDeposit: bigint
  accumulatedFee: bigint
  unclaimedRewards: bigint
  withdrawFee: bigint

  lastRate: bigint
  accumulatedYield: bigint
  checkpointedFBalance: bigint
  distributionTiers: [DistributionTier, DistributionTier]
  currentRound: number
  bump: number
}

export type DistributionTier = {
  distributedAt: bigint
  interval: bigint
  rewardShare: bigint
  accumulated: bigint
}
