import type { Connection, Keypair, PublicKey } from '@solana/web3.js'

export interface IInitializeIx {
  admin: PublicKey
  vrfAuthority: PublicKey
}

export interface ISetVrfAuthorityIx {
  admin: PublicKey
  newVrfAuthority: PublicKey
}

export interface ISetNewActivityPausedIx {
  admin: PublicKey
  paused: boolean
}

export interface IInitializeVaultIx {
  admin: PublicKey
  mint: PublicKey
  fMint: PublicKey
  pMint: PublicKey
  lending: PublicKey
  minDeposit: bigint
  withdrawFee: bigint
  tiers: [DistributionTierInput, DistributionTierInput]
}

export interface DistributionTierInput {
  interval: bigint
  rewardShare: bigint
  accumulated?: bigint
  distributedAt?: bigint
}

export interface ISetWithdrawFeeIx {
  admin: PublicKey
  vaultIndex: number
  withdrawFee: bigint
}

export interface ISetDistributionTierIntervalsIx {
  admin: PublicKey
  vaultIndex: number
  intervals: [bigint, bigint]
}

export interface ILendingAccounts {
  lendingAdmin: PublicKey
  lending: PublicKey
  mint: PublicKey
  fTokenMint: PublicKey
  supplyTokenReservesLiquidity: PublicKey
  lendingSupplyPositionOnLiquidity: PublicKey
  rateModel: PublicKey
  vault: PublicKey
  liquidity: PublicKey
  liquidityProgram: PublicKey
  rewardsRateModel: PublicKey
  lendingProgram: PublicKey
  decimal: number
}

export type LendingAccountsByMint = Record<string, ILendingAccounts>

/**
 * One mint a prize may be swapped into. `usdcPool` is the CLMM pool the second
 * hop of the route uses, so the allowlist the admin writes on chain and the
 * options the UI offers are derived from the same entry and cannot drift.
 */
export interface ISwapOutputToken {
  symbol: string
  name: string
  mint: PublicKey
  usdcPool: PublicKey
  icon: string
  decimals: number
}

export interface ISyncRateIx {
  admin: PublicKey
  vaultIndex: number
  lending: PublicKey
}

export interface ICommitIx {
  vrfAuthority: PublicKey
  vaultIndex: number
  round: number
  tickets: bigint
  /** Tier used when the Merkle root was materialized. */
  expectedIndex: number
  merkleRoot: number[]
  secretHash: number[]
  pMint: PublicKey
  lending: PublicKey
  /**
   * Accounts for the lending program's `update_rate`, which `commit` invokes
   * before checkpointing so the yield is measured against the live rate.
   * `mint` and `fTokenMint` must match `vault.mint` / `vault.f_mint`.
   */
  mint: PublicKey
  fTokenMint: PublicKey
  supplyTokenReservesLiquidity: PublicKey
  rewardsRateModel: PublicKey
  lendingProgram: PublicKey
}

export interface IDelegateRewardResultIx {
  vrfAuthority: PublicKey
  vaultIndex: number
  round: number
  // Pins the ER validator that may write the delegated request. Leave undefined on
  // devnet/mainnet (router assigns); on localnet pass the local ER validator identity.
  validator?: PublicKey
}

export interface ICommitAndDelegateRewardResultIx extends ICommitIx {
  validator?: PublicKey
}

export interface IRequestRandomnessIx {
  vrfAuthority: PublicKey
  vaultIndex: number
  round: number
  // Delegated ephemeral queue. Defaults to VRF_EPHEMERAL_QUEUE.
  oracleQueue?: PublicKey
}

export interface IUndelegateRewardResultIx {
  vrfAuthority: PublicKey
  vaultIndex: number
  round: number
}

export interface ICommitWithDepositIx
  extends Omit<
    ICommitAndDelegateRewardResultIx,
    'supplyTokenReservesLiquidity' | 'rewardsRateModel' | 'lendingProgram'
  > {
  mint: PublicKey
  vaultFTokenAccount: PublicKey
  fTokenMint: PublicKey
  vrfAuthorityTokenAccount: PublicKey
  vrfAuthorityPTokenAccount: PublicKey
  vaultTokenAccount: PublicKey
  claimAccount: PublicKey
  lendingAccounts: ILendingAccounts
}

export interface IRevealIx {
  authority: PublicKey
  vaultIndex: number
  round: number
  secretSeed: number[]
  winner: PublicKey
  winnerWeight: bigint
  expectedIndex: bigint
  merkleProof: WeightedProofNode[]
}

export interface IHarvestIx {
  tokenProgram?: PublicKey
  rentRecipient?: PublicKey
  authority: PublicKey
  winner: PublicKey
  vaultIndex: number
  round: number
  pMint: PublicKey
}

export interface IRevealAndHarvestIx extends IRevealIx {
  tokenProgram?: PublicKey
  rentRecipient?: PublicKey
  pMint: PublicKey
}

export interface IRevealAndRedeemAndSwapIx
  extends IRevealIx,
    Omit<IRedeemAndSwapIx, 'authority' | 'winner' | 'vaultIndex' | 'round'> {}

export interface ISwapConfigIx {
  admin: PublicKey
  usdcMint: PublicKey
  /**
   * The complete list, not a delta — the call replaces whatever is stored.
   * Padded to the instruction's fixed width by the builder; at most
   * `MAX_ALLOWED_OUTPUT_MINTS` entries.
   */
  outputMints: PublicKey[]
}

export interface ISwapPreferenceIx {
  user: PublicKey
  vaultIndex: number
  outputMint: PublicKey
}

export interface ICloseSwapPreferenceIx {
  user: PublicKey
  vaultIndex: number
}

/** One CLMM hop of a `swap_router_base_in` route. */
export interface ISwapHop {
  ammConfig: PublicKey
  poolState: PublicKey
  /** Where this hop's output lands: the proxy's USDC ATA, then the winner's. */
  outputTokenAccount: PublicKey
  inputVault: PublicKey
  outputVault: PublicKey
  outputTokenMint: PublicKey
  observationState: PublicKey
  /** Bitmap extension first, if the pool has one, then the tick arrays in swap order. */
  tickAccounts: PublicKey[]
}

export interface IAllowedPoolsIx {
  admin: PublicKey
  /** The complete list, not a delta. At most `MAX_ALLOWED_POOLS` entries. */
  pools: PublicKey[]
}

export interface IHarvestAndRedeemIx {
  authority: PublicKey
  winner: PublicKey
  vaultIndex: number
  round: number
  mint: PublicKey
  pMint: PublicKey
  claimAccount: PublicKey
  lendingAccounts: ILendingAccounts
  /**
   * Owning token program of `pMint`, which is also the vault's underlying and
   * fToken program. Known from config well before a round resolves, so a caller
   * that has it passes it instead of paying a mint read per instruction.
   */
  tokenProgram?: PublicKey
  /** `state.vrfAuthority`, which is where the commitment's rent returns. */
  rentRecipient?: PublicKey
}

export interface ISwapRedemptionIx {
  authority: PublicKey
  winner: PublicKey
  vaultIndex: number
  round: number
  mint: PublicKey
  usdcMint: PublicKey
  outputMint: PublicKey
  /** One hop for USDC input; otherwise two hops through USDC. */
  hops: [ISwapHop] | [ISwapHop, ISwapHop]
  minAmountOut: bigint
  /**
   * Owning token programs of `mint`, `usdcMint` and `outputMint`. All three are
   * fixed by config rather than by the round, so a caller resolving them once —
   * as the round-resolving API does — passes them here instead of paying three
   * mint reads per redemption.
   */
  tokenProgram?: PublicKey
  usdcTokenProgram?: PublicKey
  outputTokenProgram?: PublicKey
}

/**
 * The redeem and the swap must be adjacent instructions in one transaction —
 * each checks the other through the instructions sysvar — so they are built as
 * a pair rather than separately.
 */
export interface IRedeemAndSwapIx
  extends IHarvestAndRedeemIx,
    Omit<ISwapRedemptionIx, 'authority' | 'winner' | 'vaultIndex' | 'mint'> {}

export interface IDepositIx {
  depositor: PublicKey
  vaultIndex: number
  amount: bigint
  depositorTokenAccount: PublicKey
  vaultTokenAccount: PublicKey
  recipientTokenAccount: PublicKey
  mint: PublicKey
  pMint: PublicKey
  depositorPTokenAccount: PublicKey
  lendingAccounts: ILendingAccounts
}

export interface IRedeemIx {
  withdrawer: PublicKey
  vaultIndex: number
  amount: bigint
  vaultFTokenAccount: PublicKey
  vaultTokenAccount: PublicKey
  withdrawerTokenAccount: PublicKey
  mint: PublicKey
  pMint: PublicKey
  withdrawerPTokenAccount: PublicKey
  claimAccount: PublicKey
  lendingAccounts: ILendingAccounts
}

export interface ICollectFeeIx {
  admin: PublicKey
  vaultIndex: number
  vaultFTokenAccount: PublicKey
  vaultTokenAccount: PublicKey
  adminTokenAccount: PublicKey
  mint: PublicKey
  claimAccount: PublicKey
  lendingAccounts: ILendingAccounts
}

export interface IClaimIx {
  claimer: PublicKey
  vaultIndex: number
  round: number
  pMint: PublicKey
}

export interface ICreateMintIx {
  connection: Connection
  vault: PublicKey
  payer: PublicKey
  name: string
  symbol: string
  uri: string
  decimals: number
  preparedKeypair?: Keypair
  authorityOverride?: PublicKey // defaults to vault
  additionalMetadata?: Record<string, string>
}

export interface IHolders {
  wallet: PublicKey
  amount: bigint
}

export interface MintSupply {
  tokenProgram?: PublicKey
  /** Total supply in base units. */
  amount: bigint
  /** Decimals the chain reports for the mint. */
  decimals: number
}

export interface EligibleWalletsRpcOptions {
  rpcEndpoint?: string
  headers?: Record<string, string>
  /**
   * Supply already read for this mint, so the scan does not spend an RPC of its
   * own on it. A caller scanning several vaults reads every supply in one
   * `getMultipleAccounts` and hands each scan its own.
   *
   * Only trusted for the first attempt: if the holder balances disagree with
   * it, the scan re-reads the supply directly rather than retrying against a
   * number that may simply be older than the pages.
   */
  supply?: MintSupply
}

/**
 * One sibling on the path from a leaf to the root of the sum tree. Mirrors the
 * on-chain `WeightedProofNode` in `programs/moocon-vaults/src/merkle.rs`.
 */
export interface WeightedProofNode {
  siblingHash: Uint8Array
  siblingWeight: bigint
  siblingIsLeft: boolean
}
