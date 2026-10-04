// ── Shared ────────────────────────────────────────────────────────────────────

export interface Pagination {
  page: number
  limit: number
  total: number
}

// ── Drawing ───────────────────────────────────────────────────────────────────

/** What the winner actually received — the swap output when swapped. */
export interface DrawingPayout {
  swapped: boolean
  mint: string | null
  /** Raw base units — a string, since it is a bigint on the wire. */
  amount: string | null
  decimals: number | null
}

export interface Drawing {
  id: number
  vault: string
  mint: string | null
  round: number
  reward_type: number
  total_tickets: number
  winner_index: number | null
  winner_wallet: string | null
  commit_tx: string | null
  delegate_tx: string | null
  request_randomness_er: string | null
  reveal_undelegate_er: string | null
  reveal_tx: string | null
  payout_kind: 'SWAP' | 'HARVEST' | 'REVEAL_ONLY' | null
  output_mint: string | null
  output_amount: string | null
  /** Optional so an older API without it still renders the vault token. */
  payout?: DrawingPayout
  amount: number | null
  merkle_root: string | null
  secret_seed: string | null
  secret_hash: string | null
  vrf_seed: string | null
  randomness: string | null
  snapshot_at: number
  revealed_at: number | null
  winner_apr_percent: number | null
}

export interface TopDrawing extends Drawing {
  amount_usd: number
  winner_stake: number | null
}

export interface TopDrawingsResponse {
  drawings: TopDrawing[]
}

export interface WalletWinsResponse {
  wallet: string
  total_usd_won: number
  average_apr_percent: number | null
  wins: TopDrawing[]
}

/** One settled round in a vault's APR history. */
export interface VaultAprHistoryPoint {
  round: number
  reward_type: number
  revealed_at: number | null
  /** Prize in raw token units — a string, since it is a bigint on the wire. */
  amount: string
  /** This round's own winner APR. */
  apr_percent: number | null
  /** Running mean of winner APR across every settled round up to this one. */
  average_apr_percent: number | null
}

export interface VaultAprHistoryResponse {
  vault: string
  mint: string | null
  total_rounds: number
  /** Lifetime average the running mean converges to. */
  average_apr_percent: number | null
  series: VaultAprHistoryPoint[]
}

export interface DrawingsListResponse {
  drawings: Drawing[]
  pagination: Pagination
  winners_compound_average_apy_percent_by_vault?: Record<string, number | null>
  winners_compound_average_apy_percent?: number | null
  latest_payout_raw_by_vault_and_tier?: Record<string, Record<string, string>>
}

// ── Proofs ────────────────────────────────────────────────────────────────────

export interface ProofParticipant {
  wallet: string
  tickets: number
  start: number
  proof: string
}

export interface ProofConfig {
  vault: string
  mint: string | null
  round: number
  reward_type: number
  total_tickets: number
  merkle_root: string | null
  winner_wallet: string | null
  commit_tx: string | null
  delegate_tx: string | null
  request_randomness_er: string | null
  reveal_undelegate_er: string | null
  reveal_tx: string | null
}

export interface ProofContext {
  drawing_id: number
  snapshot_at: number | null
  revealed_at: number | null
  amount: number | null
}

export interface DrawingProofsResponse {
  config: ProofConfig
  context: ProofContext
  participants: ProofParticipant[]
}

export interface WalletProofResponse {
  wallet: string
  tickets: number
  start: number
  proof: string
}

// ── Mint metadata ─────────────────────────────────────────────────────────────

export interface MintData {
  address: string
  symbol: string | null
  icon: string | null
  price: number | null
  decimals: number
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StatDataPoint {
  /** null on the protocol-wide series; a vault PDA on a per-vault series. */
  vault: string | null
  tvl_usd: number
  total_rewards_usd: number
  unique_users: number
  recorded_at: number
}

export interface StatsResponse {
  data: StatDataPoint[]
  next_cursor: number | null
}

// ── Points ────────────────────────────────────────────────────────────────────

export interface PointsResponse {
  wallet: string
  stake_points: number
  referral_points: number
  total_points: number
  multiplier: number
}

export interface LeaderboardEntry {
  wallet: string
  rank: number
  stake_points: number
  referral_points: number
  total_points: number
  total_usd_won: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  total: number
  me: LeaderboardEntry | null
}

// ── Referrals ─────────────────────────────────────────────────────────────────

export interface ReferralsResponse {
  code: string | null
  referredBy: string | null
  referrals: string[]
}

export interface CreateReferralBody {
  wallet: string
  code: string
  signature: string
  ledger?: boolean
}

export interface UseReferralBody {
  wallet: string
  code: string
  signature: string
  ledger?: boolean
}

export interface ReferralSuccessResponse {
  success: true
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface VaultEvent {
  id: number
  drawing_id: number | null
  signature: string
  slot: number
  block_time: number
  event_name: string
  vault: string
  round: number
  decoded: Record<string, unknown>
  amount: number | null
  merkle_root: string | null
  secret_hash: string | null
  vrf_seed: string | null
  secret_seed: string | null
  randomness: string | null
  winner_index: number | null
  created_at: number
}

export interface EventsListResponse {
  events: VaultEvent[]
  pagination: Pagination
}

export interface EventMatch {
  merkle_root: boolean | null
  secret_hash: boolean | null
  vrf_seed: boolean | null
  winner_index: boolean | null
  randomness: boolean | null
}

export interface EventDetailResponse {
  drawing: Drawing
  commit_event: VaultEvent | null
  reveal_event: VaultEvent | null
  match: EventMatch
}
