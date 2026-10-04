import { NATIVE_MINT } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import type {
  ILendingAccounts,
  ISwapOutputToken,
  LendingAccountsByMint
} from './types'

export const VAULT_SEED = 'vault'
export const STATE_SEED = 'state'
export const REWARD_SEED = 'reward'
export const RANDOMNESS_REQUEST_SEED = 'randomness-request'
export const SWAP_PROXY_SEED = 'swap-proxy'
export const SWAP_CONFIG_SEED = 'swap-config'
export const SWAP_PREFERENCE_SEED = 'swap-preference'
export const REDEMPTION_TICKET_SEED = 'redemption-ticket'
/** Slots in `SwapConfig.allowedOutputMints`; mirrors MAX_ALLOWED_OUTPUT_MINTS. */
export const MAX_ALLOWED_OUTPUT_MINTS = 16
/** Slots in `SwapConfig.allowedPools`; mirrors MAX_ALLOWED_POOLS. */
export const MAX_ALLOWED_POOLS = 24
// Mirrors programs/moocon-vaults/src/constants.rs
export const EXCHANGE_RATE_PRECISION = 1_000_000_000_000n // 1e12
export const SHARE_DENOMINATOR = 1_000_000n // 1e6
export const TOKEN_EXCHANGE_PRICE_OFFSET = 115
// MagicBlock VRF program and oracle queues (see ephemeral_rollups_sdk::vrf::consts).
export const VRF_PROGRAM_ID = new PublicKey(
  'Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz'
)
// Delegated ephemeral VRF queue — request randomness from here inside the Ephemeral Rollup.
export const VRF_EPHEMERAL_QUEUE = new PublicKey(
  '5hBR571xnXppuCPveTrctfTU7tJLSN94nq7kv7FRK5Tc'
)
export const VRF_EPHEMERAL_TEST_QUEUE = new PublicKey(
  'Sc9MJUngNbQXSXGP3F67KvKwVnhaYn6kcioxXNVowYT'
)
// Seed of the program's scoped VRF identity PDA (b"identity").
export const VRF_IDENTITY_SEED = 'identity'

// MagicBlock Ephemeral Rollup infrastructure.
export const DELEGATION_PROGRAM_ID = new PublicKey(
  'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh'
)
export const MAGIC_PROGRAM_ID = new PublicKey(
  'Magic11111111111111111111111111111111111111'
)
export const MAGIC_CONTEXT_ID = new PublicKey(
  'MagicContext1111111111111111111111111111111'
)
// Local ephemeral validator identity (the default `ephemeral-validator` identity). Pass this
// as the `validator` when delegating on localnet so the local ER claims the account as writable.
export const LOCAL_ER_VALIDATOR = new PublicKey(
  'mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev'
)
// Base-layer RPC (delegate / undelegate land here) and router (resolves the ER endpoint).
export const MAGICBLOCK_DEVNET_RPC = 'https://rpc.magicblock.app/devnet'
export const MAGICBLOCK_MAINNET_RPC = 'https://rpc.magicblock.app/mainnet'
export const MAGICBLOCK_DEVNET_ROUTER = 'https://devnet-router.magicblock.app/'
export const MAGICBLOCK_MAINNET_ROUTER = 'https://router.magicblock.app/'
// Default ER endpoint (Asia region). Only for cases where the router can no longer resolve
// an account-specific `fqdn` — e.g. reading an ER transaction after undelegation, or
// linking an ER signature to an explorer.
export const MAGICBLOCK_DEVNET_ER = 'https://devnet-as.magicblock.app/'
export const MAGICBLOCK_MAINNET_ER = 'https://as.magicblock.app/'

export type MagicblockNetwork = 'devnet' | 'mainnet'

export function getMagicblockEndpoints(network: MagicblockNetwork): {
  rpc: string
  router: string
  er: string
} {
  return network === 'mainnet'
    ? {
        rpc: MAGICBLOCK_MAINNET_RPC,
        router: MAGICBLOCK_MAINNET_ROUTER,
        er: MAGICBLOCK_MAINNET_ER
      }
    : {
        rpc: MAGICBLOCK_DEVNET_RPC,
        router: MAGICBLOCK_DEVNET_ROUTER,
        er: MAGICBLOCK_DEVNET_ER
      }
}
export const MPL_TOKEN_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

// Raydium CLMM — target of the `swap_router_base_in` CPI in harvest_and_swap.
export const RAYDIUM_CLMM_PROGRAM_ID = new PublicKey(
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK'
)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
)
/**
 * Accounts `swap_router_base_in` reads per hop before that hop's tick arrays:
 * ammConfig, poolState, outputTokenAccount, inputVault, outputVault,
 * outputTokenMint, observationState. `harvest_and_swap` re-derives the same
 * layout on chain from `hop1TickCount`, so the two must agree exactly.
 */
export const HOP_FIXED_ACCOUNTS = 7
export const ROUND_TIME = 60 // minutes per round
export const GLOBAL_ACCOUNTS_TTL = 86400
export const REWARD_TYPE_TIER_0 = 0
export const REWARD_TYPE_TIER_1 = 1
export const HASH_SIZE = 32
export const MIN_TICKETS_FOR_REFERRAL = 0n
export const REFERRAL_CODE_MAX_LENGTH = 10
// string form so it can feed Elysia's TypeBox `pattern` (which wants a string)
export const REFERRAL_CODE_PATTERN = `^[A-Za-z0-9]{1,${REFERRAL_CODE_MAX_LENGTH}}$`
export const JUP_USD_MINT = new PublicKey(
  'JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD'
)

// Mainnet Jupiter Lend (Earn) market accounts. Regenerate with
// `bun run scripts/mainnet/list-vaults.ts` — the PDA derivations there are the
// source of truth for `rateModel`, `vault`, `liquidity` and `lendingAdmin`.

// JupUSD — Earn lending ID 9, legacy SPL Token mint.
export const JUPITER_JUP_USD_ACCOUNTS: ILendingAccounts = {
  mint: JUP_USD_MINT,
  fTokenMint: new PublicKey('7GxATsNMnaC88vdwd2t3mwrFuQwwGvmYPrUQ4D6FotXk'),
  lending: new PublicKey('papYEgeG5uPE4niUWZhihUUzVVotJn1mAWbYo2UBSHi'),
  lendingAdmin: new PublicKey('5nmGjA4s7ATzpBQXC5RNceRpaJ7pYw2wKsNBWyuSAZV6'),
  lendingProgram: new PublicKey('jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9'),
  lendingSupplyPositionOnLiquidity: new PublicKey(
    'DXFoJruECdEch2KpzLQ2cSpxoBSsyg4bpYPnHYofsbD4'
  ),
  liquidity: new PublicKey('7s1da8DduuBFqGra5bJBjpnvL5E9mGzCuMk1Qkh4or2Z'),
  liquidityProgram: new PublicKey(
    'jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC'
  ),
  rateModel: new PublicKey('2hT44GA9r5PiqsbbmqN5CuF7ymtquoEdokRncAs9CVej'),
  rewardsRateModel: new PublicKey(
    'E3U32h49TL9Qof3NeLja9qJxTrGYpY1o1NQPtrSLJjcc'
  ),
  supplyTokenReservesLiquidity: new PublicKey(
    '2tQE8jVR5ezDw3PDa21BNzfyQ14Ug5cTf6n3swJNjkod'
  ),
  vault: new PublicKey('9kGqd5zsQGaFfFPdUuEgbRM4V7x72Jdt7WTS4uRouAQ7'),
  decimal: 6
}

// WSOL — Earn lending ID 3, legacy SPL Token mint.
export const JUPITER_WSOL_ACCOUNTS: ILendingAccounts = {
  mint: new PublicKey('So11111111111111111111111111111111111111112'),
  fTokenMint: new PublicKey('2uQsyo1fXXQkDtcpXnLofWy88PxcvnfH2L8FPSE62FVU'),
  lending: new PublicKey('BeAqbxfrcXmzEYT2Ra62oW2MqkuFDHaCtps47Mzg6Zj3'),
  lendingAdmin: new PublicKey('5nmGjA4s7ATzpBQXC5RNceRpaJ7pYw2wKsNBWyuSAZV6'),
  lendingProgram: new PublicKey('jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9'),
  lendingSupplyPositionOnLiquidity: new PublicKey(
    '4SkEYxmiRgQ4VYyvh9VB4k39M49BpqazyzDUFDzJhXQm'
  ),
  liquidity: new PublicKey('7s1da8DduuBFqGra5bJBjpnvL5E9mGzCuMk1Qkh4or2Z'),
  liquidityProgram: new PublicKey(
    'jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC'
  ),
  rateModel: new PublicKey('Acvyi9HBGmqh3Exe1N4PjBVyY8fokq2AdC6fSLqV6KSo'),
  rewardsRateModel: new PublicKey(
    'CkeQGDRsgMZcCaU8cZEdC2aFAohia4jLzL36RaLcUDsR'
  ),
  supplyTokenReservesLiquidity: new PublicKey(
    '4Y66HtUEqbbbpZdENGtFdVhUMS3tnagffn3M4do59Nfy'
  ),
  vault: new PublicKey('5JP5zgYCb9W37QQLgAHRHuinFLrKt87akDY1CgZoTPzr'),
  decimal: 9
}
export const LENDING_ACCOUNTS_BY_MINT: LendingAccountsByMint = {
  [JUP_USD_MINT.toBase58()]: JUPITER_JUP_USD_ACCOUNTS,
  [NATIVE_MINT.toBase58()]: JUPITER_WSOL_ACCOUNTS
}
// Every route is <vault mint> -> USDC -> <output mint>, so USDC is the
// intermediate `swap_config.usdc_mint` and the pair of every allowed pool.
export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
)

/**
 * The mints a winner may be paid in. This is the source of truth for both the
 * on-chain allowlist (`scripts/mainnet/set-swap-config.ts`) and the picker in
 * the app — offering a mint that is not in `SwapConfig.allowedOutputMints`
 * fails on chain with `OutputMintNotWhitelisted`.
 *
 * All xStocks are Token-2022 mints; derive their ATAs with the mint's own
 * owning program rather than the legacy default.
 */
export const SWAP_OUTPUT_TOKENS: ISwapOutputToken[] = [
  {
    symbol: 'SPYx',
    name: 'SP500 xStock',
    mint: new PublicKey('XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W'),
    usdcPool: new PublicKey('6truu3rZuiB9rKQg4VYC3Dt3QwV7DgwGqXrYUcrvnDDE'),
    icon: 'https://xstocks-metadata.backed.fi/logos/tokens/SPYx.png',
    decimals: 8
  },
  {
    symbol: 'NVDAx',
    name: 'NVIDIA xStock',
    mint: new PublicKey('Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh'),
    usdcPool: new PublicKey('49iMatQtoyabsYAQc8GafVq6aeBFVDxSRH44oiatyyw6'),
    icon: 'https://xstocks-metadata.backed.fi/logos/tokens/NVDAx.png',
    decimals: 8
  },
  {
    symbol: 'QQQx',
    name: 'Nasdaq xStock',
    mint: new PublicKey('Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ'),
    usdcPool: new PublicKey('GMjGLWzvK75LPetrgAmdeXnvxc4fUuQPwJxeQqTDU1aG'),
    icon: 'https://xstocks-metadata.backed.fi/logos/tokens/QQQx.png',
    decimals: 8
  },
  {
    symbol: 'CRCLx',
    name: 'Circle xStock',
    mint: new PublicKey('XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1'),
    usdcPool: new PublicKey('GYqHjuDzTiw7i52Xv1qohDE6eJr6eSZpsrBVikGZyaFV'),
    icon: 'https://xstocks-metadata.backed.fi/logos/tokens/CRCLx.png',
    decimals: 8
  },
  {
    symbol: 'TSLAx',
    name: 'Tesla xStock',
    mint: new PublicKey('XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB'),
    usdcPool: new PublicKey('8aDaBQkTrS6HVMjyc6EZebgdiaXhLYGriDWKWWp1NpFF'),
    icon: 'https://xstocks-metadata.backed.fi/logos/tokens/TSLAx.png',
    decimals: 8
  }
]

export function getSwapOutputToken(mint: PublicKey): ISwapOutputToken | null {
  return SWAP_OUTPUT_TOKENS.find((token) => token.mint.equals(mint)) ?? null
}

export const VAULT_COMMIT_DEPOSIT_AMOUNTS: Record<string, bigint> = {
  JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD: 1_000n, // JupUSD, 6 decimals — 0.001 JupUSD
  So11111111111111111111111111111111111111112: 1_0_000n // WSOL, 9 decimals — 0.00001 SOL
}

export const STATS_INTERVALS: Record<string, number> = {
  '1h': 3600,
  '4h': 14400,
  '1d': 86400
}

export function getLendingAccountsForMint(
  mint: PublicKey
): ILendingAccounts | null {
  return LENDING_ACCOUNTS_BY_MINT[mint.toBase58()] ?? null
}

/**
 * Commitment every *eligibility read* uses: holder pages, pMint supplies, and
 * the vault/Clock gate read.
 *
 * `confirmed` rather than `finalized`. The drawing cron samples balances every
 * 15 seconds, and finalized state trails the tip by roughly 6-13 seconds — so
 * at that cadence a finalized scan is sampling a view already half a tick old,
 * which spends the RPC budget of fast sampling without getting its accuracy.
 *
 * The safety cost is bounded rather than absent. A `confirmed` read can in
 * principle be rolled back, and a balance that never reached the canonical
 * chain would then have earned credit. The TWAB's own structure caps that at
 * roughly one sample gap: `min(before, after)` credits a balance only for gaps
 * it bracketed, and `peak` caps a wallet's average at a balance that was
 * actually observed. A rollback that survives into `finalized` divergence is
 * caught separately by the round-divergence guard in `lifecycle.ts`.
 *
 * Transaction finality is a different question and deliberately NOT covered by
 * this constant — commit/reveal confirmation, reveal recovery, and blockhash
 * expiry all stay on `finalized`, because recording a winner from a
 * rolled-back transaction is not a bounded error.
 */
export const ELIGIBILITY_COMMITMENT = 'confirmed' as const
