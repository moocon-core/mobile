import type { BN, IdlAccounts, Program } from '@coral-xyz/anchor'
import {
  AccountLayout,
  MintLayout,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { Buffer } from 'buffer'
import {
  ELIGIBILITY_COMMITMENT,
  getLendingAccountsForMint,
  RANDOMNESS_REQUEST_SEED,
  REDEMPTION_TICKET_SEED,
  REWARD_SEED,
  STATE_SEED,
  SWAP_CONFIG_SEED,
  SWAP_PREFERENCE_SEED,
  SWAP_PROXY_SEED,
  VAULT_SEED
} from './consts'
import type { MooconVaults } from './idl/moocon_vaults'
import type {
  EligibleWalletsRpcOptions,
  IHolders,
  ILendingAccounts,
  MintSupply
} from './types'
import { getClaimAccount } from './pdas'
import type { DistributionTier, VaultAccount } from './accounts'

export type { DistributionTier, VaultAccount }

/** `getMultipleAccounts` caps a request at 100 keys. */
const MAX_ACCOUNTS_PER_REQUEST = 100

const ELIGIBLE_WALLETS_PAGE_LIMIT = 1000
const ELIGIBLE_WALLETS_MAX_ATTEMPTS = 8
const ELIGIBLE_WALLETS_RETRY_BASE_DELAY_MS = 250
const ELIGIBLE_WALLETS_RETRY_MAX_DELAY_MS = 8_000
const ELIGIBLE_WALLETS_SLOT_TOLERANCE = 5

function getEligibleWalletFilters(
  pMint: PublicKey,
  tokenProgram: PublicKey
): Array<Record<string, unknown>> {
  const mintFilter = { memcmp: { offset: 0, bytes: pMint.toBase58() } }

  return tokenProgram.equals(TOKEN_PROGRAM_ID)
    ? [{ dataSize: AccountLayout.span }, mintFilter]
    : [mintFilter]
}

type ProgramAccountV2 = {
  pubkey: string
  account: {
    data: [string, 'base64']
  }
}

type ProgramAccountsV2Result = {
  context: { slot: number }
  value: {
    accounts: ProgramAccountV2[]
    paginationKey: string | null
  }
}

export class RetryableEligibleWalletsError extends Error {}

export class InvalidEligibleWalletsResponseError extends Error {}

export interface EligibleWalletsSnapshot {
  holders: IHolders[]
  minSlot: number
  maxSlot: number
  pageCount: number
  /** Total pMint supply at `maxSlot`, base units. Bounds the holder sum. */
  supply: bigint
  /** Decimals the chain reports for pMint, to check configured constants against. */
  supplyDecimals: number
}

export interface FinalizedVaultTiming {
  vault: VaultAccount
  slot: number
  unixTimestamp: bigint
}

const TRANSIENT_RPC_ERROR_CODES = new Set([-32005, -32603, -32002, -32003])

// Raw types as decoded by Anchor (u64 = BN)
type RawVault = IdlAccounts<MooconVaults>['vault']
type RawState = IdlAccounts<MooconVaults>['state']
type RawSwapConfig = IdlAccounts<MooconVaults>['swapConfig']
type RawSwapPreference = IdlAccounts<MooconVaults>['swapPreference']
type RawRewardCommitment = IdlAccounts<MooconVaults>['rewardCommitment']
type RawRandomnessRequest = IdlAccounts<MooconVaults>['randomnessRequest']

// Parsed types with u64 as bigint, u32 as number
export type StateAccount = {
  admin: PublicKey
  vrfAuthority: PublicKey
  lastVault: number
  bump: number
  newActivityPaused: number
}

export type SwapPreferenceAccount = {
  user: PublicKey
  vault: PublicKey
  outputMint: PublicKey
  bump: number
}

export type SwapConfigAccount = {
  usdcMint: PublicKey
  /** Only the live prefix — empty slots are not surfaced. */
  allowedOutputMints: PublicKey[]
  /** Pools a route may pass through; empty means no route is possible. */
  allowedPools: PublicKey[]
  bump: number
}

export type RewardCommitmentAccount = {
  claimer: PublicKey
  vault: PublicKey
  amount: bigint
  totalTickets: bigint
  winnerIndex: bigint
  secretHash: number[]
  merkleRoot: number[]
  randomness: number[]
  round: number
  rewardType: number
  bump: number
  slot: bigint
}

export type RandomnessRequestAccount = {
  commitment: PublicKey
  randomness: number[]
  bump: number
  requested: number
  fulfilled: number
}

enum Keys {
  Vaults = 'vaults',
  Stakes = 'stakes',
  Commitments = 'commitments'
}

export class Fetcher {
  state: StateAccount | null
  program: Program<MooconVaults>
  tokenPrograms: Map<string, PublicKey>;

  [Keys.Vaults]: Map<string, VaultAccount>;
  [Keys.Commitments]: Map<string, RewardCommitmentAccount>

  constructor(program: Program<MooconVaults>) {
    this.program = program
    this.vaults = new Map()
    this.commitments = new Map()
    this.state = null
    this.tokenPrograms = new Map()
  }

  // ── State ────────────────────────────────────────────────────────────────

  async getState(forceFetch = false): Promise<StateAccount> {
    if (!forceFetch && this.state !== null) {
      return this.state
    }
    const [address] = this.getStateAddress()
    const raw = await this.program.account.state.fetch(address)
    this.state = parseState(raw)
    return this.state
  }

  getStateAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(STATE_SEED)],
      this.program.programId
    )
  }

  // ── Vaults ──────────────────────────────────────────────────────────────

  async getAllVaults(_forceFetch = false): Promise<VaultAccount[]> {
    const entries = await this.program.account.vault.all()
    return entries.map((e) => parseVault(e.account))
  }

  async getVaultByIndex(index: number): Promise<VaultAccount> {
    const [address] = this.getVaultAddress(index)
    return this.getVaultByAddress(address)
  }

  /**
   * Every vault `0..count-1` in one `getMultipleAccounts`.
   *
   * Vault addresses are PDAs of their index, so the whole set is known without
   * asking anyone — which makes reading them one at a time a round trip per
   * vault for accounts the RPC will hand over together. `null` marks an index
   * whose account does not exist, so one missing vault does not cost the caller
   * the rest of the batch.
   */
  async getVaultsByIndex(count: number): Promise<Array<VaultAccount | null>> {
    if (count <= 0) return []
    const addresses = Array.from(
      { length: count },
      (_, i) => this.getVaultAddress(i)[0]
    )

    const accounts: Array<VaultAccount | null> = []
    for (let i = 0; i < addresses.length; i += MAX_ACCOUNTS_PER_REQUEST) {
      const chunk = addresses.slice(i, i + MAX_ACCOUNTS_PER_REQUEST)
      const infos =
        await this.program.provider.connection.getMultipleAccountsInfo(chunk)
      for (const info of infos) {
        if (!info) {
          accounts.push(null)
          continue
        }
        accounts.push(
          parseVault(
            this.program.coder.accounts.decode<RawVault>('vault', info.data)
          )
        )
      }
    }
    return accounts
  }

  /**
   * Read the vault and Clock sysvar in one RPC context, at
   * `ELIGIBILITY_COMMITMENT`.
   *
   * Named "finalized" from when it was; the commitment now follows the rest of
   * the eligibility path. The round-divergence guard in `lifecycle.ts` is what
   * actually decides whether a round read is trustworthy, and it re-reads and
   * compares context slots rather than relying on the commitment alone.
   */
  async getFinalizedVaultTiming(index: number): Promise<FinalizedVaultTiming> {
    const [address] = this.getVaultAddress(index)
    const response =
      await this.program.provider.connection.getMultipleAccountsInfoAndContext(
        [address, SYSVAR_CLOCK_PUBKEY],
        { commitment: ELIGIBILITY_COMMITMENT }
      )
    const vaultInfo = response.value[0]
    const clockInfo = response.value[1]
    if (!vaultInfo)
      throw new Error(`Vault account not found: ${address.toBase58()}`)
    if (!clockInfo || clockInfo.data.length < 40) {
      throw new Error('Clock sysvar account is missing or malformed')
    }

    const raw = this.program.coder.accounts.decode<RawVault>(
      'vault',
      vaultInfo.data
    )
    return {
      vault: parseVault(raw),
      slot: response.context.slot,
      unixTimestamp: Buffer.from(clockInfo.data).readBigInt64LE(32)
    }
  }

  async getVaultByAddress(address: PublicKey): Promise<VaultAccount> {
    const account = parseVault(await this.program.account.vault.fetch(address))
    return account
  }

  getVaultAddress(index: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED), indexToBytes(index)],
      this.program.programId
    )
  }

  // ── Reward commitments / randomness requests ────────────────────────────

  async getCommitment(
    vault: PublicKey,
    round: number
  ): Promise<RewardCommitmentAccount> {
    const [address] = this.getCommitmentAddress(vault, round)
    return this.getCommitmentByAddress(address)
  }

  async getCommitmentsForAddress(
    wallet: PublicKey
  ): Promise<RewardCommitmentAccount[]> {
    const entries = await this.program.account.rewardCommitment.all([
      {
        memcmp: {
          offset: 8, // discriminator
          bytes: wallet.toBase58()
        }
      }
    ])
    return entries.map((e) => parseRewardCommitment(e.account))
  }

  async getCommitmentByAddress(
    address: PublicKey
  ): Promise<RewardCommitmentAccount> {
    const account = parseRewardCommitment(
      await this.program.account.rewardCommitment.fetch(address)
    )
    return account
  }

  async getAllCommitments(): Promise<RewardCommitmentAccount[]> {
    const entries = await this.program.account.rewardCommitment.all()
    // for (const e of entries) {
    //   this.setCached(this.rewards, e.publicKey, parseReward(e.account))
    // }
    return entries.map((e) => parseRewardCommitment(e.account))
  }

  getCommitmentAddress(vault: PublicKey, round: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(REWARD_SEED), vault.toBytes(), indexToBytes(round)],
      this.program.programId
    )
  }

  // ── Swap config ─────────────────────────────────────────────────────────

  /** Admin-owned route policy read by `harvest_and_swap`. */
  async getSwapConfig(): Promise<SwapConfigAccount> {
    const [address] = this.getSwapConfigAddress()
    return parseSwapConfig(await this.program.account.swapConfig.fetch(address))
  }

  /**
   * A user's opt-in for one vault. `null` when they have not enabled swapping —
   * the account's absence is the opt-out, so a missing account is an answer,
   * not an error.
   */
  async getSwapPreference(
    user: PublicKey,
    vault: PublicKey
  ): Promise<SwapPreferenceAccount | null> {
    const [address] = this.getSwapPreferenceAddress(user, vault)
    const raw = await this.program.account.swapPreference.fetchNullable(address)
    return raw === null ? null : parseSwapPreference(raw)
  }

  getSwapPreferenceAddress(
    user: PublicKey,
    vault: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(SWAP_PREFERENCE_SEED), user.toBytes(), vault.toBytes()],
      this.program.programId
    )
  }

  getSwapConfigAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(SWAP_CONFIG_SEED)],
      this.program.programId
    )
  }

  /**
   * Signer-only PDA that holds a harvested reward for the length of
   * `harvest_and_swap` and signs the route. Derived from `state`, not the vault,
   * so one pair of intermediate ATAs serves every vault.
   */
  getSwapProxyAddress(): [PublicKey, number] {
    const [state] = this.getStateAddress()
    return PublicKey.findProgramAddressSync(
      [Buffer.from(SWAP_PROXY_SEED), state.toBytes()],
      this.program.programId
    )
  }

  /**
   * Carries the redeemed amount from `harvest_and_redeem` to the
   * `swap_redemption` that must follow it. A singleton like the proxy it
   * describes, and created and closed inside that one transaction — so it never
   * exists to be fetched, only to be addressed.
   */
  getRedemptionTicketAddress(): [PublicKey, number] {
    const [state] = this.getStateAddress()
    return PublicKey.findProgramAddressSync(
      [Buffer.from(REDEMPTION_TICKET_SEED), state.toBytes()],
      this.program.programId
    )
  }

  getRandomnessRequestAddress(commitment: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(RANDOMNESS_REQUEST_SEED), commitment.toBytes()],
      this.program.programId
    )
  }

  async getRandomnessRequestByAddress(
    address: PublicKey
  ): Promise<RandomnessRequestAccount> {
    return parseRandomnessRequest(
      await this.program.account.randomnessRequest.fetch(address)
    )
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Everything a Jupiter Lend CPI needs for one vault, in one place.
   *
   * `harvestAndRedeemIx` and the other lending builders all want the same four
   * values, and every caller was assembling them by hand from the vault account,
   * `getLendingAccountsForMint` and `getClaimAccount`.
   */
  async getLendingContext(vaultIndex: number): Promise<{
    mint: PublicKey
    pMint: PublicKey
    lendingAccounts: ILendingAccounts
    claimAccount: PublicKey
  }> {
    const { mint, pMint } = await this.getVaultByIndex(vaultIndex)
    const lendingAccounts = getLendingAccountsForMint(mint)
    if (lendingAccounts === null) {
      throw new Error(
        `No Jupiter Lend market known for mint ${mint.toBase58()}`
      )
    }
    return {
      mint,
      pMint,
      lendingAccounts,
      claimAccount: getClaimAccount(mint, lendingAccounts.lendingAdmin)
    }
  }

  async getTokenProgramId(
    mint: PublicKey,
    forceFetch = false
  ): Promise<PublicKey> {
    const key = mint.toBase58()
    const cached = this.tokenPrograms.get(key)
    if (!forceFetch && cached !== undefined) return cached

    const info = await this.program.provider.connection.getAccountInfo(mint)
    if (info === null) throw new Error(`Mint account not found: ${key}`)
    if (
      !info.owner.equals(TOKEN_PROGRAM_ID) &&
      !info.owner.equals(TOKEN_2022_PROGRAM_ID)
    ) {
      throw new Error(
        `Unsupported token program ${info.owner.toBase58()} for mint ${key}`
      )
    }

    this.tokenPrograms.set(key, info.owner)
    return info.owner
  }

  async getEligibleWallets(
    pMint: PublicKey,
    rpcOptions: EligibleWalletsRpcOptions = {}
  ): Promise<IHolders[]> {
    return (await this.getEligibleWalletSnapshot(pMint, rpcOptions)).holders
  }

  async getEligibleWalletSnapshot(
    pMint: PublicKey,
    rpcOptions: EligibleWalletsRpcOptions = {}
  ): Promise<EligibleWalletsSnapshot> {
    const connection = this.program.provider.connection
    let rawSnapshot: ConsistentProgramAccounts | null = null
    let lastRetryableError: Error | null = null

    for (let attempt = 1; attempt <= ELIGIBLE_WALLETS_MAX_ATTEMPTS; attempt++) {
      try {
        rawSnapshot = await fetchConsistentProgramAccounts(
          rpcOptions.rpcEndpoint ?? connection.rpcEndpoint,
          pMint,
          await this.getTokenProgramId(pMint),
          rpcOptions.headers,
          // Only the first attempt trusts the caller's batched read. A
          // disagreement is most likely a mint landing between that read and
          // these pages, and retrying against the same number would fail the
          // same way — so the retry reads this mint's supply directly.
          attempt === 1 ? rpcOptions.supply : undefined
        )
        break
      } catch (error) {
        if (!(error instanceof RetryableEligibleWalletsError)) {
          throw error
        }

        lastRetryableError = error
        if (attempt < ELIGIBLE_WALLETS_MAX_ATTEMPTS) {
          const ceiling = Math.min(
            ELIGIBLE_WALLETS_RETRY_MAX_DELAY_MS,
            ELIGIBLE_WALLETS_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
          )
          await delay(Math.floor(Math.random() * ceiling))
        }
      }
    }

    if (rawSnapshot === null) {
      const failureDetail =
        lastRetryableError === null ? '' : `: ${lastRetryableError.message}`
      throw new Error(
        `Unable to fetch a consistent eligible-wallet snapshot after ${ELIGIBLE_WALLETS_MAX_ATTEMPTS} attempts${failureDetail}`
      )
    }

    const holders = rawSnapshot.accounts.map(({ account }) => {
      const decoded = AccountLayout.decode(
        new Uint8Array(Buffer.from(account.data[0], 'base64'))
      )

      return {
        wallet: new PublicKey(decoded.owner), // actual wallet owner
        amount: BigInt(decoded.amount.toString()) // SPL token amount
      }
    })

    return {
      holders: holders.filter((h) => h.amount > 0n),
      minSlot: rawSnapshot.minSlot,
      maxSlot: rawSnapshot.maxSlot,
      pageCount: rawSnapshot.pageCount,
      supply: rawSnapshot.supply,
      supplyDecimals: rawSnapshot.supplyDecimals
    }
  }
}

/**
 * Every mint's supply and decimals in one `getMultipleAccounts`.
 *
 * A drawing tick scans several vaults, and asking `getTokenSupply` per vault
 * spends one round trip per vault to learn numbers that all live in accounts
 * the RPC will hand over together. The base `Mint` layout is the first 82 bytes
 * for both SPL Token and Token-2022 — extensions are appended after it — so one
 * decode covers either program.
 *
 * Read at `ELIGIBILITY_COMMITMENT`, the same commitment the holder pages use —
 * the supply has to describe the same view of the chain as the balances it
 * bounds.
 */
export async function fetchMintSupplies(
  rpcEndpoint: string,
  mints: PublicKey[],
  headers?: Record<string, string>
): Promise<Map<string, MintSupply>> {
  const supplies = new Map<string, MintSupply>()
  if (mints.length === 0) return supplies

  // Deduplicate: two vaults sharing a pMint would otherwise take two slots in
  // the request and decode to the same answer.
  const unique = [...new Set(mints.map((mint) => mint.toBase58()))]

  for (let i = 0; i < unique.length; i += MAX_ACCOUNTS_PER_REQUEST) {
    const chunk = unique.slice(i, i + MAX_ACCOUNTS_PER_REQUEST)
    const accounts = await rpcGetMultipleAccounts(rpcEndpoint, chunk, headers)

    chunk.forEach((mint, index) => {
      const account = accounts[index]
      if (account === null) {
        throw new InvalidEligibleWalletsResponseError(
          `getMultipleAccounts returned no account for mint ${mint}`
        )
      }
      if (account.data.length < MintLayout.span) {
        throw new InvalidEligibleWalletsResponseError(
          `account for mint ${mint} is ${account.data.length} bytes, too short for a mint`
        )
      }
      const decoded = MintLayout.decode(
        new Uint8Array(account.data.subarray(0, MintLayout.span))
      )
      if (!decoded.isInitialized) {
        throw new InvalidEligibleWalletsResponseError(
          `mint ${mint} is not initialized`
        )
      }
      supplies.set(mint, {
        amount: BigInt(decoded.supply.toString()),
        decimals: decoded.decimals,
        ...(account.owner ? { tokenProgram: account.owner } : {})
      })
    })
  }

  return supplies
}

/** `getMultipleAccounts` at the eligibility commitment, raw data per key. */
async function rpcGetMultipleAccounts(
  rpcEndpoint: string,
  keys: string[],
  headers?: Record<string, string>
): Promise<Array<{ data: Buffer; owner?: PublicKey } | null>> {
  let response: Response
  try {
    response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'getMintSupplies',
        method: 'getMultipleAccounts',
        params: [
          keys,
          { commitment: ELIGIBILITY_COMMITMENT, encoding: 'base64' }
        ]
      })
    })
  } catch (error) {
    throw new RetryableEligibleWalletsError(
      `getMultipleAccounts request failed: ${errorMessage(error)}`
    )
  }

  if (!response.ok) {
    const message = `getMultipleAccounts HTTP ${response.status}`
    if (response.status === 429 || response.status >= 500) {
      throw new RetryableEligibleWalletsError(message)
    }
    throw new InvalidEligibleWalletsResponseError(message)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    throw new InvalidEligibleWalletsResponseError(
      `getMultipleAccounts returned invalid JSON: ${errorMessage(error)}`
    )
  }
  if (!isRecord(body)) {
    throw new InvalidEligibleWalletsResponseError(
      'getMultipleAccounts returned a non-object response'
    )
  }
  if ('error' in body) {
    const rpcError = body.error
    const code = isRecord(rpcError) ? rpcError.code : undefined
    const ErrorType =
      typeof code === 'number' && TRANSIENT_RPC_ERROR_CODES.has(code)
        ? RetryableEligibleWalletsError
        : InvalidEligibleWalletsResponseError
    throw new ErrorType(`getMultipleAccounts RPC error ${String(code)}`)
  }

  const value = isRecord(body.result) ? body.result.value : undefined
  if (!Array.isArray(value) || value.length !== keys.length) {
    throw new InvalidEligibleWalletsResponseError(
      'getMultipleAccounts returned a mismatched account list'
    )
  }

  return value.map((account) => {
    if (account === null) return null
    if (
      !isRecord(account) ||
      !Array.isArray(account.data) ||
      typeof account.data[0] !== 'string' ||
      account.data[1] !== 'base64'
    ) {
      throw new InvalidEligibleWalletsResponseError(
        'getMultipleAccounts returned invalid account data'
      )
    }
    const owner =
      typeof account.owner === 'string'
        ? new PublicKey(account.owner)
        : undefined
    if (
      owner &&
      ![TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].some((program) =>
        program.equals(owner)
      )
    ) {
      throw new InvalidEligibleWalletsResponseError(
        'Mint has an unsupported token program'
      )
    }
    return { data: Buffer.from(account.data[0], 'base64'), owner }
  })
}

/** One mint's supply, for the re-read a scan needs when it disagrees. */
async function fetchTokenSupply(
  rpcEndpoint: string,
  pMint: PublicKey,
  headers?: Record<string, string>
): Promise<MintSupply> {
  const supplies = await fetchMintSupplies(rpcEndpoint, [pMint], headers)
  const supply = supplies.get(pMint.toBase58())
  if (supply === undefined) {
    throw new InvalidEligibleWalletsResponseError(
      `no supply returned for mint ${pMint.toBase58()}`
    )
  }
  return supply
}

interface ConsistentProgramAccounts {
  accounts: ProgramAccountV2[]
  minSlot: number
  maxSlot: number
  pageCount: number
  supply: bigint
  supplyDecimals: number
}

async function fetchConsistentProgramAccounts(
  rpcEndpoint: string,
  pMint: PublicKey,
  tokenProgram: PublicKey,
  headers?: Record<string, string>,
  knownSupply?: MintSupply
): Promise<ConsistentProgramAccounts> {
  const accounts: ProgramAccountV2[] = []
  const seenPaginationKeys = new Set<string>()
  // Pages are concatenated, so an overlap between two of them is a token
  // account counted twice — and a balance counted twice is ticket weight
  // minted out of nothing. A repeated pagination key is already refused below;
  // this refuses the same account arriving under two different keys.
  const seenAccounts = new Set<string>()
  let expectedSlot: number | null = null
  let minSlot = Number.MAX_SAFE_INTEGER
  let maxSlot = 0
  let pageCount = 0
  let paginationKey: string | null = null

  do {
    const page = await fetchProgramAccountsPage(
      rpcEndpoint,
      pMint,
      tokenProgram,
      paginationKey,
      headers
    )
    pageCount += 1
    minSlot = Math.min(minSlot, page.context.slot)
    maxSlot = Math.max(maxSlot, page.context.slot)

    if (expectedSlot === null) {
      expectedSlot = page.context.slot
    } else if (
      Math.abs(page.context.slot - expectedSlot) >
      ELIGIBLE_WALLETS_SLOT_TOLERANCE
    ) {
      throw new RetryableEligibleWalletsError(
        `getProgramAccountsV2 slot changed from ${expectedSlot} to ${page.context.slot}`
      )
    }

    for (const entry of page.value.accounts) {
      if (seenAccounts.has(entry.pubkey)) {
        throw new InvalidEligibleWalletsResponseError(
          `getProgramAccountsV2 returned token account ${entry.pubkey} twice`
        )
      }
      seenAccounts.add(entry.pubkey)
      accounts.push(entry)
    }
    paginationKey = page.value.paginationKey

    if (paginationKey !== null) {
      if (seenPaginationKeys.has(paginationKey)) {
        throw new InvalidEligibleWalletsResponseError(
          `getProgramAccountsV2 repeated pagination key: ${paginationKey}`
        )
      }
      seenPaginationKeys.add(paginationKey)
    }
  } while (paginationKey !== null)

  if (pageCount === 0 || !Number.isSafeInteger(minSlot)) {
    throw new InvalidEligibleWalletsResponseError(
      'getProgramAccountsV2 returned no pages'
    )
  }

  // The one authoritative number to check the scan against: holder balances
  // become ticket weight, so a scan summing above the supply it was taken from
  // has counted something twice — a duplicated page, a stale clone, a proxy
  // replaying a response — and must never reach the accumulator.
  const supply =
    knownSupply ?? (await fetchTokenSupply(rpcEndpoint, pMint, headers))
  let total = 0n
  for (const entry of accounts) {
    total += BigInt(
      AccountLayout.decode(
        new Uint8Array(Buffer.from(entry.account.data[0], 'base64'))
      ).amount.toString()
    )
  }
  if (total > supply.amount) {
    // The pages are pinned to one slot and the supply is not, so a mint or burn
    // landing between them is a race rather than a fault. Raised as retryable
    // *inside* the attempt loop, which re-reads both — and drops the caller's
    // pre-read supply on the retry — so only a persistent disagreement escapes.
    throw new RetryableEligibleWalletsError(
      `eligible wallet balances sum to ${total} above pMint supply ${supply.amount}`
    )
  }

  return {
    accounts,
    minSlot,
    maxSlot,
    pageCount,
    supply: supply.amount,
    supplyDecimals: supply.decimals
  }
}

async function fetchProgramAccountsPage(
  rpcEndpoint: string,
  pMint: PublicKey,
  tokenProgram: PublicKey,
  paginationKey: string | null,
  headers?: Record<string, string>
): Promise<ProgramAccountsV2Result> {
  let response: Response

  try {
    response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'getEligibleWallets',
        method: 'getProgramAccountsV2',
        params: [
          tokenProgram.toBase58(),
          {
            commitment: ELIGIBILITY_COMMITMENT,
            withContext: true,
            encoding: 'base64',
            limit: ELIGIBLE_WALLETS_PAGE_LIMIT,
            filters: getEligibleWalletFilters(pMint, tokenProgram),
            ...(paginationKey === null ? {} : { paginationKey })
          }
        ]
      })
    })
  } catch (error) {
    throw new RetryableEligibleWalletsError(
      `getProgramAccountsV2 request failed: ${errorMessage(error)}`
    )
  }

  if (!response.ok) {
    const message = `getProgramAccountsV2 HTTP ${response.status}`
    if (response.status === 429 || response.status >= 500) {
      throw new RetryableEligibleWalletsError(message)
    }
    throw new InvalidEligibleWalletsResponseError(message)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    throw new InvalidEligibleWalletsResponseError(
      `getProgramAccountsV2 returned invalid JSON: ${errorMessage(error)}`
    )
  }

  if (!isRecord(body)) {
    throw new InvalidEligibleWalletsResponseError(
      'getProgramAccountsV2 returned a non-object response'
    )
  }

  if ('error' in body) {
    const rpcError = body.error
    if (!isRecord(rpcError) || typeof rpcError.code !== 'number') {
      throw new InvalidEligibleWalletsResponseError(
        'getProgramAccountsV2 returned a malformed RPC error'
      )
    }

    const message =
      typeof rpcError.message === 'string'
        ? rpcError.message
        : 'Unknown RPC error'
    const ErrorType = TRANSIENT_RPC_ERROR_CODES.has(rpcError.code)
      ? RetryableEligibleWalletsError
      : InvalidEligibleWalletsResponseError
    throw new ErrorType(`getProgramAccountsV2 RPC ${rpcError.code}: ${message}`)
  }

  return parseProgramAccountsResult(body.result)
}

function parseProgramAccountsResult(result: unknown): ProgramAccountsV2Result {
  if (
    !isRecord(result) ||
    !isRecord(result.context) ||
    !isRecord(result.value)
  ) {
    throw new InvalidEligibleWalletsResponseError(
      'getProgramAccountsV2 response is missing context or value'
    )
  }

  const { slot } = result.context
  const { accounts, paginationKey } = result.value
  if (!Number.isSafeInteger(slot) || !Array.isArray(accounts)) {
    throw new InvalidEligibleWalletsResponseError(
      'getProgramAccountsV2 response has an invalid slot or accounts list'
    )
  }
  if (paginationKey !== null && typeof paginationKey !== 'string') {
    throw new InvalidEligibleWalletsResponseError(
      'getProgramAccountsV2 response has an invalid pagination key'
    )
  }

  for (const entry of accounts) {
    if (
      !isRecord(entry) ||
      typeof entry.pubkey !== 'string' ||
      !isRecord(entry.account) ||
      !Array.isArray(entry.account.data) ||
      typeof entry.account.data[0] !== 'string' ||
      entry.account.data[1] !== 'base64'
    ) {
      throw new InvalidEligibleWalletsResponseError(
        'getProgramAccountsV2 response contains invalid account data'
      )
    }
  }

  return result as ProgramAccountsV2Result
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function indexToBytes(index: number): Buffer {
  const buf = Buffer.alloc(4)
  buf.writeUInt32LE(index)
  return buf
}

function bnToBigInt(v: BN): bigint {
  return BigInt(v.toString())
}

export function parseVault(raw: RawVault): VaultAccount {
  const distributionTiers = raw.distributionTiers.map(
    parseDistributionTier
  ) as [DistributionTier, DistributionTier]

  return {
    mint: raw.mint,
    fMint: raw.fMint,
    pMint: raw.pMint,
    lending: raw.lending,
    minDeposit: bnToBigInt(raw.minDeposit),
    accumulatedFee: bnToBigInt(raw.accumulatedFee),
    unclaimedRewards: bnToBigInt(raw.unclaimedRewards),
    withdrawFee: bnToBigInt(raw.withdrawFee),
    lastRate: bnToBigInt(raw.lastRate),
    accumulatedYield: bnToBigInt(raw.accumulatedYield),
    checkpointedFBalance: bnToBigInt(raw.checkpointedFBalance),
    distributionTiers,
    currentRound: raw.currentRound,
    bump: raw.bump
  }
}

function parseDistributionTier(raw: {
  distributedAt: BN
  interval: BN
  rewardShare: BN
  accumulated: BN
}): DistributionTier {
  return {
    distributedAt: bnToBigInt(raw.distributedAt),
    interval: bnToBigInt(raw.interval),
    rewardShare: bnToBigInt(raw.rewardShare),
    accumulated: bnToBigInt(raw.accumulated)
  }
}

function parseSwapPreference(raw: RawSwapPreference): SwapPreferenceAccount {
  return {
    user: raw.user,
    vault: raw.vault,
    outputMint: raw.outputMint,
    bump: raw.bump
  }
}

function parseSwapConfig(raw: RawSwapConfig): SwapConfigAccount {
  return {
    usdcMint: raw.usdcMint,
    // Entries past `allowedCount` are the default pubkey and are never matched
    // on chain, so they are not surfaced here either.
    allowedOutputMints: raw.allowedOutputMints.slice(0, raw.allowedCount),
    allowedPools: raw.allowedPools.slice(0, raw.allowedPoolCount),
    bump: raw.bump
  }
}

function parseState(raw: RawState): StateAccount {
  return {
    admin: raw.admin,
    vrfAuthority: raw.vrfAuthority,
    lastVault: raw.lastVault,
    bump: raw.bump,
    newActivityPaused: raw.newActivityPaused
  }
}

export function parseRewardCommitment(
  raw: RawRewardCommitment
): RewardCommitmentAccount {
  return {
    claimer: raw.claimer,
    vault: raw.vault,
    amount: bnToBigInt(raw.amount),
    totalTickets: bnToBigInt(raw.totalTickets),
    winnerIndex: bnToBigInt(raw.winnerIndex),
    secretHash: raw.secretHash,
    merkleRoot: raw.merkleRoot,
    randomness: raw.randomness,
    round: raw.round,
    rewardType: raw.rewardType,
    bump: raw.bump,
    slot: bnToBigInt(raw.slot)
  }
}

export function parseRandomnessRequest(
  raw: RawRandomnessRequest
): RandomnessRequestAccount {
  return {
    commitment: raw.commitment,
    randomness: raw.randomness,
    bump: raw.bump,
    requested: raw.requested,
    fulfilled: raw.fulfilled
  }
}
