// ts-sdk by relative path, not package name: bun can't install a nested
// `file:` dep, and consumers resolve this package through its real path, so
// they never see their own `ts-sdk`. Only `consts` (web3.js + spl-token) is
// imported at runtime — the barrel would drag Anchor/Raydium/Umi into mobile.
export {
  EXCHANGE_RATE_PRECISION,
  getLendingAccountsForMint,
  getMagicblockEndpoints,
  getSwapOutputToken,
  REFERRAL_CODE_MAX_LENGTH,
  STATS_INTERVALS
} from '../../ts-sdk/consts'
export type { DistributionTier, VaultAccount } from '../../ts-sdk/accounts'
