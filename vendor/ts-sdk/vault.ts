import { AnchorProvider, BN, Program, type Wallet } from '@coral-xyz/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
  type Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  Transaction,
  type TransactionInstruction
} from '@solana/web3.js'
import {
  MAX_ALLOWED_OUTPUT_MINTS,
  MAX_ALLOWED_POOLS,
  MEMO_PROGRAM_ID,
  RAYDIUM_CLMM_PROGRAM_ID,
  VAULT_COMMIT_DEPOSIT_AMOUNTS,
  VRF_EPHEMERAL_QUEUE
} from './consts'
import { Fetcher } from './fetcher'
import type { MooconVaults } from './idl/moocon_vaults'
import IDL from './idl/moocon_vaults.json'
import type {
  IAllowedPoolsIx,
  IClaimIx,
  ICloseSwapPreferenceIx,
  ICollectFeeIx,
  ICommitAndDelegateRewardResultIx,
  ICommitIx,
  ICommitWithDepositIx,
  IDelegateRewardResultIx,
  IDepositIx,
  IHarvestAndRedeemIx,
  IHarvestIx,
  IInitializeIx,
  IInitializeVaultIx,
  IRedeemAndSwapIx,
  IRedeemIx,
  IRequestRandomnessIx,
  IRevealAndHarvestIx,
  IRevealAndRedeemAndSwapIx,
  IRevealIx,
  ISetDistributionTierIntervalsIx,
  ISetNewActivityPausedIx,
  ISetVrfAuthorityIx,
  ISetWithdrawFeeIx,
  ISwapConfigIx,
  ISwapHop,
  ISwapPreferenceIx,
  ISwapRedemptionIx,
  ISyncRateIx,
  IUndelegateRewardResultIx
} from './types'

export class Vault {
  connection: Connection
  program: Program<MooconVaults>
  fetcher: Fetcher

  constructor(connection: Connection) {
    this.connection = connection
    this.program = new Program<MooconVaults>(
      IDL as MooconVaults,
      // Read-only: every instruction here is returned unsigned, so the
      // provider never needs a real wallet.
      new AnchorProvider(connection, {} as Wallet)
    )
    this.fetcher = new Fetcher(this.program)
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async initializeIx(params: IInitializeIx) {
    const { admin, vrfAuthority } = params
    const [state] = this.fetcher.getStateAddress()

    return await this.program.methods
      .initialize(vrfAuthority)
      .accountsStrict({
        admin,
        state,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  async setVrfAuthorityIx(params: ISetVrfAuthorityIx) {
    const { admin, newVrfAuthority } = params
    const [state] = this.fetcher.getStateAddress()

    return await this.program.methods
      .setVrfAuthority(newVrfAuthority)
      .accountsStrict({
        admin,
        state
      })
      .instruction()
  }

  async setNewActivityPausedIx(params: ISetNewActivityPausedIx) {
    const { admin, paused } = params
    const [state] = this.fetcher.getStateAddress()

    return await this.program.methods
      .setNewActivityPaused(paused)
      .accountsStrict({
        admin,
        state
      })
      .instruction()
  }

  async initializeVaultIx(params: IInitializeVaultIx) {
    const {
      admin,
      mint,
      fMint,
      lending,
      pMint,
      minDeposit,
      withdrawFee,
      tiers
    } = params
    const [state] = this.fetcher.getStateAddress()
    const stateAccount = await this.fetcher.getState()
    const [vault] = this.fetcher.getVaultAddress(stateAccount.lastVault)
    const tokenProgram = await this.fetcher.getTokenProgramId(fMint)
    const vaultTokenAccount = getAssociatedTokenAddressSync(
      mint,
      vault,
      true,
      tokenProgram
    )
    const vaultFTokenAccount = getAssociatedTokenAddressSync(
      fMint,
      vault,
      true,
      tokenProgram
    )

    const normalizedTiers = [
      {
        distributedAt: new BN((tiers[0].distributedAt ?? 0n).toString()),
        interval: new BN(tiers[0].interval.toString()),
        rewardShare: new BN(tiers[0].rewardShare.toString()),
        accumulated: new BN((tiers[0].accumulated ?? 0n).toString())
      },
      {
        distributedAt: new BN((tiers[1].distributedAt ?? 0n).toString()),
        interval: new BN(tiers[1].interval.toString()),
        rewardShare: new BN(tiers[1].rewardShare.toString()),
        accumulated: new BN((tiers[1].accumulated ?? 0n).toString())
      }
    ] as [
      {
        distributedAt: BN
        interval: BN
        rewardShare: BN
        accumulated: BN
      },
      {
        distributedAt: BN
        interval: BN
        rewardShare: BN
        accumulated: BN
      }
    ]

    return await this.program.methods
      .initializeVault(
        new BN(minDeposit.toString()),
        new BN(withdrawFee.toString()),
        normalizedTiers
      )
      .accountsStrict({
        admin,
        state,
        vault,
        lending,
        mint,
        fMint,
        pMint,
        vaultTokenAccount,
        vaultFTokenAccount,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  async setWithdrawFeeIx(params: ISetWithdrawFeeIx) {
    const { admin, vaultIndex, withdrawFee } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)

    return await this.program.methods
      .setWithdrawFee(vaultIndex, new BN(withdrawFee.toString()))
      .accountsStrict({
        admin,
        state,
        vault
      })
      .instruction()
  }

  async setDistributionTierIntervalsIx(
    params: ISetDistributionTierIntervalsIx
  ) {
    const { admin, vaultIndex, intervals } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)

    return await this.program.methods
      .setDistributionTierIntervals(vaultIndex, [
        new BN(intervals[0].toString()),
        new BN(intervals[1].toString())
      ])
      .accountsStrict({
        admin,
        state,
        vault
      })
      .instruction()
  }

  async syncRateIx(params: ISyncRateIx) {
    const { admin, vaultIndex, lending } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)

    return await this.program.methods
      .syncRate(vaultIndex)
      .accountsStrict({
        admin,
        state,
        vault,
        lending
      })
      .instruction()
  }

  // ── Authority (VRF) ────────────────────────────────────────────────────────

  async commitIx(params: ICommitIx) {
    const {
      vrfAuthority,
      vaultIndex,
      round,
      tickets,
      expectedIndex,
      merkleRoot,
      secretHash,
      pMint,
      lending,
      mint,
      fTokenMint,
      supplyTokenReservesLiquidity,
      rewardsRateModel,
      lendingProgram
    } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [request] = this.fetcher.getRandomnessRequestAddress(commitment)
    // Re-roll guard: the program checks the previous round's reward is finalized.
    // Round 0 has no predecessor, so the optional account is null.
    const prevReward =
      round > 0 ? this.fetcher.getCommitmentAddress(vault, round - 1)[0] : null

    // `commit` runs on the base layer: it checkpoints yield and creates the reward PDA.
    // Randomness is requested separately on the Ephemeral Rollup via `requestRandomnessIx`.
    return await this.program.methods
      .commit(
        vaultIndex,
        new BN(tickets.toString()),
        expectedIndex,
        merkleRoot,
        secretHash
      )
      .accountsStrict({
        vrfAuthority,
        state,
        vault,
        lending,
        pMint,
        mint,
        fTokenMint,
        supplyTokenReservesLiquidity,
        rewardsRateModel,
        lendingProgram,
        commitment,
        request,
        prevReward,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  /**
   * Base-layer instruction: delegate the round's reward PDA to the Ephemeral Rollup.
   * Send after `commit` and before `requestRandomnessIx`. Anchor resolves every injected
   * delegation account (buffer / delegation record / metadata / programs) from the IDL.
   */
  async delegateRewardResultIx(params: IDelegateRewardResultIx) {
    const { vrfAuthority, vaultIndex, round, validator } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [request] = this.fetcher.getRandomnessRequestAddress(commitment)
    return await this.program.methods
      .delegateRewardResult(vaultIndex, validator ?? null)
      .accountsPartial({ vrfAuthority, state, vault, commitment, request })
      .instruction()
  }

  async commitAndDelegateRewardResultTransaction(
    params: ICommitAndDelegateRewardResultIx
  ): Promise<Transaction> {
    const commitIx = await this.commitIx(params)
    const delegateIx = await this.delegateRewardResultIx(params)
    return new Transaction().add(commitIx, delegateIx)
  }

  /**
   * Ephemeral-Rollup instruction: request VRF randomness for the delegated reward from the
   * delegated ephemeral queue. Must be sent to the ER connection (not the base layer).
   */
  async requestRandomnessIx(params: IRequestRandomnessIx) {
    const { vrfAuthority, vaultIndex, round, oracleQueue } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [request] = this.fetcher.getRandomnessRequestAddress(commitment)
    return await this.program.methods
      .requestRandomness(vaultIndex)
      .accountsPartial({
        vrfAuthority,
        state,
        vault,
        commitment,
        request,
        oracleQueue: oracleQueue ?? VRF_EPHEMERAL_QUEUE
      })
      .instruction()
  }

  /**
   * Ephemeral-Rollup instruction: commit the finalized reward back to base layer and
   * undelegate it (so base-layer `claim` can read the winner). Send to the ER connection,
   * typically bundled right after `revealIx` in the same ER transaction.
   */
  async undelegateRewardResultIx(params: IUndelegateRewardResultIx) {
    const { vrfAuthority, vaultIndex, round } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [request] = this.fetcher.getRandomnessRequestAddress(commitment)
    return await this.program.methods
      .undelegateRewardResult(vaultIndex, round)
      .accountsPartial({ vrfAuthority, state, vault, commitment, request })
      .instruction()
  }

  async commitAndDelegateWithRateRefreshIxs(params: ICommitWithDepositIx) {
    const {
      vrfAuthority,
      vaultIndex,
      mint,
      pMint,
      vaultFTokenAccount,
      vaultTokenAccount,
      vrfAuthorityTokenAccount,
      vrfAuthorityPTokenAccount,
      claimAccount,
      lendingAccounts
    } = params

    const depositAmount = VAULT_COMMIT_DEPOSIT_AMOUNTS[mint.toBase58()]

    const depositIx = await this.depositIx({
      depositor: vrfAuthority,
      vaultIndex,
      amount: depositAmount,
      depositorTokenAccount: vrfAuthorityTokenAccount,
      vaultTokenAccount,
      recipientTokenAccount: vaultFTokenAccount,
      mint,
      pMint,
      depositorPTokenAccount: vrfAuthorityPTokenAccount,
      lendingAccounts
    })

    const commitIx = await this.commitIx({
      ...params,
      supplyTokenReservesLiquidity:
        lendingAccounts.supplyTokenReservesLiquidity,
      rewardsRateModel: lendingAccounts.rewardsRateModel,
      lendingProgram: lendingAccounts.lendingProgram
    })
    const delegateIx = await this.delegateRewardResultIx(params)

    const redeemIx = await this.redeemIx({
      withdrawer: vrfAuthority,
      vaultIndex,
      amount: depositAmount,
      vaultFTokenAccount,
      vaultTokenAccount,
      withdrawerTokenAccount: vrfAuthorityTokenAccount,
      mint,
      pMint,
      withdrawerPTokenAccount: vrfAuthorityPTokenAccount,
      claimAccount,
      lendingAccounts
    })

    return [depositIx, commitIx, delegateIx, redeemIx]
  }

  async revealIx(params: IRevealIx) {
    const {
      authority,
      vaultIndex,
      round,
      secretSeed,
      winner,
      winnerWeight,
      expectedIndex,
      merkleProof
    } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [request] = this.fetcher.getRandomnessRequestAddress(commitment)

    const proof = merkleProof.map((node) => ({
      siblingHash: Array.from(node.siblingHash),
      siblingWeight: new BN(node.siblingWeight.toString()),
      siblingIsLeft: node.siblingIsLeft
    }))

    return await this.program.methods
      .reveal(
        vaultIndex,
        secretSeed,
        winner,
        new BN(winnerWeight.toString()),
        new BN(expectedIndex.toString()),
        proof
      )
      .accountsStrict({
        vrfAuthority: authority,
        state,
        vault,
        commitment,
        request
      })
      .instruction()
  }

  /**
   * Base-layer authority/admin payout for an already-finalized reward. The winner's
   * canonical pToken ATA must already exist; this instruction never creates it.
   */
  async harvestIx(params: IHarvestIx) {
    const { authority, winner, vaultIndex, round, pMint } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const tokenProgram =
      params.tokenProgram ?? (await this.fetcher.getTokenProgramId(pMint))
    const winnerPTokenAccount = getAssociatedTokenAddressSync(
      pMint,
      winner,
      true,
      tokenProgram
    )
    const rentRecipient =
      params.rentRecipient ?? (await this.fetcher.getState()).vrfAuthority

    return await this.program.methods
      .harvest(vaultIndex, round)
      .accountsStrict({
        authority,
        state,
        vault,
        commitment,
        winner,
        pMint,
        winnerPTokenAccount,
        tokenProgram,
        rentRecipient
      })
      .instruction()
  }

  /**
   * Pad a caller's list into the fixed-width array the instruction takes.
   * `PublicKey.default` is the empty marker, and the program rejects a populated
   * slot after one, so the padding has to be a clean tail.
   */
  static padOutputMints(outputMints: PublicKey[]): PublicKey[] {
    if (outputMints.length > MAX_ALLOWED_OUTPUT_MINTS) {
      throw new Error(
        `swap config holds at most ${MAX_ALLOWED_OUTPUT_MINTS} output mints, got ${outputMints.length}`
      )
    }
    return Array.from(
      { length: MAX_ALLOWED_OUTPUT_MINTS },
      (_, i) => outputMints[i] ?? PublicKey.default
    )
  }

  /**
   * Create the route policy `harvest_and_swap` reads. Admin only, once.
   */
  async initializeSwapConfigIx(params: ISwapConfigIx) {
    const { admin, usdcMint, outputMints } = params
    const [state] = this.fetcher.getStateAddress()
    const [swapConfig] = this.fetcher.getSwapConfigAddress()

    return await this.program.methods
      .initializeSwapConfig(usdcMint, Vault.padOutputMints(outputMints))
      .accountsStrict({
        admin,
        state,
        swapConfig,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  /**
   * Replace the pools a route may pass through. Its own instruction because both
   * fixed-width lists in one call would not fit a v0 transaction.
   */
  async setAllowedPoolsIx(params: IAllowedPoolsIx) {
    const { admin, pools } = params
    const [state] = this.fetcher.getStateAddress()
    const [swapConfig] = this.fetcher.getSwapConfigAddress()

    return await this.program.methods
      .setAllowedPools(Vault.padPools(pools))
      .accountsStrict({ admin, state, swapConfig })
      .instruction()
  }

  /** Pad a caller's pool list into the fixed-width array the instruction takes. */
  static padPools(pools: PublicKey[]): PublicKey[] {
    if (pools.length > MAX_ALLOWED_POOLS) {
      throw new Error(
        `swap config holds at most ${MAX_ALLOWED_POOLS} pools, got ${pools.length}`
      )
    }
    return Array.from(
      { length: MAX_ALLOWED_POOLS },
      (_, i) => pools[i] ?? PublicKey.default
    )
  }

  /**
   * Replace the route policy wholesale. `outputMints` is the complete list the
   * config should hold afterwards, not an addition — listing a new xStock means
   * passing the existing mints alongside it.
   */
  async setSwapConfigIx(params: ISwapConfigIx) {
    const { admin, usdcMint, outputMints } = params
    const [state] = this.fetcher.getStateAddress()
    const [swapConfig] = this.fetcher.getSwapConfigAddress()

    return await this.program.methods
      .setSwapConfig(usdcMint, Vault.padOutputMints(outputMints))
      .accountsStrict({ admin, state, swapConfig })
      .instruction()
  }

  /**
   * Opt in to being paid a prize in `outputMint`, or change which mint that is.
   * Signed by the user: `harvest_and_swap` reads the destination from here
   * precisely because the winner does not sign the payout.
   */
  async setSwapPreferenceIx(params: ISwapPreferenceIx) {
    const { user, vaultIndex, outputMint } = params
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [swapConfig] = this.fetcher.getSwapConfigAddress()
    const [swapPreference] = this.fetcher.getSwapPreferenceAddress(user, vault)

    return await this.program.methods
      .setSwapPreference(vaultIndex)
      .accountsStrict({
        user,
        vault,
        swapConfig,
        outputMint,
        swapPreference,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  /** Opt back out and reclaim the rent. Prizes settle as pTokens again. */
  async closeSwapPreferenceIx(params: ICloseSwapPreferenceIx) {
    const { user, vaultIndex } = params
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [swapPreference] = this.fetcher.getSwapPreferenceAddress(user, vault)

    return await this.program.methods
      .closeSwapPreference(vaultIndex)
      .accountsStrict({ user, vault, swapPreference })
      .instruction()
  }

  /**
   * Flatten a route into the `remaining_accounts` order `swap_router_base_in`
   * consumes: each hop's seven fixed accounts, then that hop's tick accounts.
   * `hop1TickCount` is what lets the program re-derive the same split on chain,
   * so it is returned alongside rather than left to the caller to count.
   */
  static swapRouteAccounts(hops: [ISwapHop] | [ISwapHop, ISwapHop]) {
    if (hops.length !== 1 && hops.length !== 2)
      throw new Error('Expected one or two swap hops')
    for (const hop of hops) {
      if (hop.tickAccounts.length < 1 || hop.tickAccounts.length > 255) {
        throw new Error('Each hop requires 1–255 tick accounts')
      }
    }
    const remainingAccounts = hops.flatMap((hop) =>
      [
        { pubkey: hop.ammConfig, isSigner: false, isWritable: false },
        { pubkey: hop.poolState, isSigner: false, isWritable: true },
        { pubkey: hop.outputTokenAccount, isSigner: false, isWritable: true },
        { pubkey: hop.inputVault, isSigner: false, isWritable: true },
        { pubkey: hop.outputVault, isSigner: false, isWritable: true },
        { pubkey: hop.outputTokenMint, isSigner: false, isWritable: false },
        { pubkey: hop.observationState, isSigner: false, isWritable: true }
      ].concat(
        hop.tickAccounts.map((pubkey) => ({
          pubkey,
          isSigner: false,
          isWritable: true
        }))
      )
    )
    return {
      remainingAccounts,
      hop1TickCount: hops.length === 1 ? 0 : hops[0].tickAccounts.length
    }
  }

  /**
   * First half of paying a prize as a tokenized stock: settle the reward and
   * unwind it to the vault's underlying on the swap proxy.
   *
   * Never sent alone — the program requires `swapRedemptionIx` to be the very
   * next instruction. Use `redeemAndSwapInstructions` unless you are testing the
   * pairing itself.
   */
  async harvestAndRedeemIx(params: IHarvestAndRedeemIx) {
    const {
      authority,
      winner,
      vaultIndex,
      round,
      mint,
      pMint,
      claimAccount,
      lendingAccounts
    } = params

    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)
    const [swapProxy] = this.fetcher.getSwapProxyAddress()
    const [redemptionTicket] = this.fetcher.getRedemptionTicketAddress()
    const tokenProgram =
      params.tokenProgram ?? (await this.fetcher.getTokenProgramId(pMint))
    const rentRecipient =
      params.rentRecipient ?? (await this.fetcher.getState()).vrfAuthority
    const ata = (m: PublicKey, owner: PublicKey) =>
      getAssociatedTokenAddressSync(m, owner, true, tokenProgram)

    return await this.program.methods
      .harvestAndRedeem(vaultIndex, round)
      .accountsStrict({
        authority,
        state,
        vault,
        commitment,
        winner,
        swapProxy,
        pMint,
        proxyPTokenAccount: ata(pMint, swapProxy),
        mint,
        proxyTokenAccount: ata(mint, swapProxy),
        vaultFTokenAccount: ata(lendingAccounts.fTokenMint, vault),
        fTokenMint: lendingAccounts.fTokenMint,
        lendingAdmin: lendingAccounts.lendingAdmin,
        lending: lendingAccounts.lending,
        supplyTokenReservesLiquidity:
          lendingAccounts.supplyTokenReservesLiquidity,
        lendingSupplyPositionOnLiquidity:
          lendingAccounts.lendingSupplyPositionOnLiquidity,
        rateModel: lendingAccounts.rateModel,
        liquidityVault: lendingAccounts.vault,
        claimAccount,
        liquidity: lendingAccounts.liquidity,
        liquidityProgram: lendingAccounts.liquidityProgram,
        rewardsRateModel: lendingAccounts.rewardsRateModel,
        lendingProgram: lendingAccounts.lendingProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        rentRecipient,
        vaultTokenAccount: ata(mint, vault),
        redemptionTicket
      })
      .instruction()
  }

  /**
   * Second half: route the redeemed underlying into the winner's account.
   *
   * Never sent alone — the program requires `harvestAndRedeemIx` to be the
   * instruction immediately before it.
   */
  async swapRedemptionIx(params: ISwapRedemptionIx) {
    const {
      authority,
      winner,
      vaultIndex,
      round,
      mint,
      usdcMint,
      outputMint,
      hops,
      minAmountOut
    } = params

    const maxU64 = (1n << 64n) - 1n
    if (minAmountOut < 0n || minAmountOut > maxU64)
      throw new Error('minAmountOut must be a u64')
    if (hops.length !== (mint.equals(usdcMint) ? 1 : 2)) {
      throw new Error(
        'USDC input requires one hop; other inputs require two hops through USDC'
      )
    }

    const [state] = this.fetcher.getStateAddress()
    const [swapConfig] = this.fetcher.getSwapConfigAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [swapPreference] = this.fetcher.getSwapPreferenceAddress(
      winner,
      vault
    )
    const [swapProxy] = this.fetcher.getSwapProxyAddress()
    const [redemptionTicket] = this.fetcher.getRedemptionTicketAddress()

    const tokenProgram =
      params.tokenProgram ?? (await this.fetcher.getTokenProgramId(mint))
    const usdcTokenProgram =
      params.usdcTokenProgram ??
      (await this.fetcher.getTokenProgramId(usdcMint))
    const outputTokenProgram =
      params.outputTokenProgram ??
      (await this.fetcher.getTokenProgramId(outputMint))
    const ata = (m: PublicKey, owner: PublicKey, program: PublicKey) =>
      getAssociatedTokenAddressSync(m, owner, true, program)

    const { remainingAccounts, hop1TickCount } = Vault.swapRouteAccounts(hops)

    return await this.program.methods
      .swapRedemption(
        vaultIndex,
        round,
        hop1TickCount,
        new BN(minAmountOut.toString())
      )
      .accountsStrict({
        authority,
        state,
        swapConfig,
        winner,
        vault,
        swapPreference,
        swapProxy,
        mint,
        proxyTokenAccount: ata(mint, swapProxy, tokenProgram),
        usdcMint,
        proxyUsdcTokenAccount: ata(usdcMint, swapProxy, usdcTokenProgram),
        outputMint,
        winnerOutputTokenAccount: ata(outputMint, winner, outputTokenProgram),
        clmmProgram: RAYDIUM_CLMM_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        memoProgram: MEMO_PROGRAM_ID,
        tokenProgram,
        usdcTokenProgram,
        outputTokenProgram,
        instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        legacyTokenProgram: TOKEN_PROGRAM_ID,
        redemptionTicket
      })
      .remainingAccounts(remainingAccounts)
      .instruction()
  }

  /**
   * The adjacent pair, in the only order the program accepts. Each instruction
   * checks the other through the instructions sysvar, so nothing may sit between
   * them, and the redeem hands the swap its measured amount on a ticket PDA — so
   * there is no amount to quote here.
   */
  async redeemAndSwapInstructions(
    params: IRedeemAndSwapIx
  ): Promise<[TransactionInstruction, TransactionInstruction]> {
    return [
      await this.harvestAndRedeemIx(params),
      await this.swapRedemptionIx({
        authority: params.authority,
        winner: params.winner,
        vaultIndex: params.vaultIndex,
        round: params.round,
        mint: params.mint,
        usdcMint: params.usdcMint,
        outputMint: params.outputMint,
        hops: params.hops,
        minAmountOut: params.minAmountOut,
        tokenProgram: params.tokenProgram,
        usdcTokenProgram: params.usdcTokenProgram,
        outputTokenProgram: params.outputTokenProgram
      })
    ]
  }

  /** Build the canonical atomic base-layer ordering: reveal first, then harvest. */
  async revealAndHarvestTransaction(
    params: IRevealAndHarvestIx
  ): Promise<Transaction> {
    const revealIx = await this.revealIx(params)
    const harvestIx = await this.harvestIx({
      authority: params.authority,
      winner: params.winner,
      vaultIndex: params.vaultIndex,
      round: params.round,
      pMint: params.pMint,
      tokenProgram: params.tokenProgram,
      rentRecipient: params.rentRecipient
    })
    return new Transaction().add(revealIx, harvestIx)
  }

  /**
   * The swap flavour of the same ordering: reveal writes the winner, then the
   * redeem and the swap settle and route it — three instructions, in this order,
   * in one transaction.
   *
   * Only as a **v1 transaction**: the merkle proof puts the bundle past v0's
   * 1232 bytes, and a proof cannot be compressed into a lookup table.
   */
  async revealAndRedeemAndSwapInstructions(
    params: IRevealAndRedeemAndSwapIx
  ): Promise<
    [TransactionInstruction, TransactionInstruction, TransactionInstruction]
  > {
    return [
      await this.revealIx(params),
      ...(await this.redeemAndSwapInstructions({
        authority: params.authority,
        winner: params.winner,
        vaultIndex: params.vaultIndex,
        round: params.round,
        mint: params.mint,
        pMint: params.pMint,
        claimAccount: params.claimAccount,
        lendingAccounts: params.lendingAccounts,
        usdcMint: params.usdcMint,
        outputMint: params.outputMint,
        hops: params.hops,
        minAmountOut: params.minAmountOut,
        tokenProgram: params.tokenProgram,
        usdcTokenProgram: params.usdcTokenProgram,
        outputTokenProgram: params.outputTokenProgram,
        rentRecipient: params.rentRecipient
      }))
    ]
  }

  // ── User ──────────────────────────────────────────────────────────────────

  async depositIx(params: IDepositIx) {
    const {
      depositor,
      vaultIndex,
      amount,
      depositorTokenAccount,
      vaultTokenAccount,
      recipientTokenAccount,
      mint,
      pMint,
      depositorPTokenAccount,
      lendingAccounts
    } = params
    const [state] = this.fetcher.getStateAddress()
    const [premiumVault] = this.fetcher.getVaultAddress(vaultIndex)
    const tokenProgram = await this.fetcher.getTokenProgramId(
      lendingAccounts.fTokenMint
    )

    return await this.program.methods
      .deposit(vaultIndex, new BN(amount.toString()))
      .accountsStrict({
        depositor,
        state,
        premiumVault,
        depositorTokenAccount,
        vaultTokenAccount,
        recipientTokenAccount,
        mint,
        pMint,
        depositorPTokenAccount,
        lendingAdmin: lendingAccounts.lendingAdmin,
        lending: lendingAccounts.lending,
        fTokenMint: lendingAccounts.fTokenMint,
        supplyTokenReservesLiquidity:
          lendingAccounts.supplyTokenReservesLiquidity,
        lendingSupplyPositionOnLiquidity:
          lendingAccounts.lendingSupplyPositionOnLiquidity,
        rateModel: lendingAccounts.rateModel,
        vault: lendingAccounts.vault,
        liquidity: lendingAccounts.liquidity,
        liquidityProgram: lendingAccounts.liquidityProgram,
        rewardsRateModel: lendingAccounts.rewardsRateModel,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        lendingProgram: lendingAccounts.lendingProgram
      })
      .instruction()
  }

  async redeemIx(params: IRedeemIx) {
    const {
      withdrawer,
      vaultIndex,
      amount,
      vaultFTokenAccount,
      vaultTokenAccount,
      withdrawerTokenAccount,
      mint,
      pMint,
      withdrawerPTokenAccount,
      claimAccount,
      lendingAccounts
    } = params
    const [premiumVault] = this.fetcher.getVaultAddress(vaultIndex)
    const tokenProgram = await this.fetcher.getTokenProgramId(
      lendingAccounts.fTokenMint
    )

    return await this.program.methods
      .withdraw(vaultIndex, new BN(amount.toString()))
      .accountsStrict({
        withdrawer,
        premiumVault,
        vaultFTokenAccount,
        vaultTokenAccount,
        withdrawerTokenAccount,
        mint,
        pMint,
        withdrawerPTokenAccount,
        lendingAdmin: lendingAccounts.lendingAdmin,
        lending: lendingAccounts.lending,
        fTokenMint: lendingAccounts.fTokenMint,
        supplyTokenReservesLiquidity:
          lendingAccounts.supplyTokenReservesLiquidity,
        lendingSupplyPositionOnLiquidity:
          lendingAccounts.lendingSupplyPositionOnLiquidity,
        rateModel: lendingAccounts.rateModel,
        vault: lendingAccounts.vault,
        claimAccount,
        liquidity: lendingAccounts.liquidity,
        liquidityProgram: lendingAccounts.liquidityProgram,
        rewardsRateModel: lendingAccounts.rewardsRateModel,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        lendingProgram: lendingAccounts.lendingProgram
      })
      .instruction()
  }

  async claimIx(params: IClaimIx) {
    const { claimer, vaultIndex, round, pMint } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const [commitment] = this.fetcher.getCommitmentAddress(vault, round)

    const tokenProgram = await this.fetcher.getTokenProgramId(pMint)
    const claimerPTokenAccount = getAssociatedTokenAddressSync(
      pMint,
      claimer,
      false,
      tokenProgram
    )

    // Fetch state for rentRecipient (vrf_authority)
    const stateAccount = await this.fetcher.getState()

    return await this.program.methods
      .claim(vaultIndex, round)
      .accountsStrict({
        claimer,
        state,
        vault,
        commitment,
        pMint,
        claimerPTokenAccount,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rentRecipient: stateAccount.vrfAuthority
      })
      .instruction()
  }

  async collectFeeIx(params: ICollectFeeIx) {
    const {
      admin,
      vaultIndex,
      vaultFTokenAccount,
      vaultTokenAccount,
      adminTokenAccount,
      mint,
      claimAccount,
      lendingAccounts
    } = params
    const [state] = this.fetcher.getStateAddress()
    const [vault] = this.fetcher.getVaultAddress(vaultIndex)
    const tokenProgram = await this.fetcher.getTokenProgramId(
      lendingAccounts.fTokenMint
    )

    return await this.program.methods
      .collectFee(vaultIndex)
      .accountsStrict({
        admin,
        state,
        vault,
        vaultFTokenAccount,
        vaultTokenAccount,
        adminTokenAccount,
        mint,
        lendingAdmin: lendingAccounts.lendingAdmin,
        lending: lendingAccounts.lending,
        fTokenMint: lendingAccounts.fTokenMint,
        supplyTokenReservesLiquidity:
          lendingAccounts.supplyTokenReservesLiquidity,
        lendingSupplyPositionOnLiquidity:
          lendingAccounts.lendingSupplyPositionOnLiquidity,
        rateModel: lendingAccounts.rateModel,
        lendingVault: lendingAccounts.vault,
        claimAccount,
        liquidity: lendingAccounts.liquidity,
        liquidityProgram: lendingAccounts.liquidityProgram,
        rewardsRateModel: lendingAccounts.rewardsRateModel,
        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        lendingProgram: lendingAccounts.lendingProgram
      })
      .instruction()
  }
}
