import type { ApiFetch } from './client'
import { queryKeys } from './query-keys'
import type {
  CreateReferralBody,
  DrawingProofsResponse,
  DrawingsListResponse,
  EventDetailResponse,
  EventsListResponse,
  LeaderboardResponse,
  PointsResponse,
  ReferralSuccessResponse,
  ReferralsResponse,
  StatsResponse,
  TopDrawingsResponse,
  UseReferralBody,
  VaultAprHistoryResponse,
  WalletProofResponse,
  WalletWinsResponse
} from './types'
import type { StatsInterval } from '../stats'

export interface StatsQueryParams {
  interval: StatsInterval
  limit?: number
  cursor?: string | null
  /** Omit for the protocol-wide series; a vault PDA scopes it to one vault. */
  vault?: string | null
}

export function statsPath({ interval, limit = 100, cursor = null, vault = null }: StatsQueryParams): string {
  const params = new URLSearchParams({ interval, limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  if (vault) params.set('vault', vault)
  return `/api/stats?${params.toString()}`
}

export function leaderboardPath(page: number, limit: number, wallet?: string | null): string {
  return `/api/points/leaderboard?page=${page}&limit=${limit}${wallet ? `&wallet=${wallet}` : ''}`
}

/** Query options (key, fetcher, cache timings) for `useQuery`, shared by web and mobile. */
export function createApiQueries(apiFetch: ApiFetch) {
  return {
    drawings: (page = 1, limit = 20) => ({
      queryKey: queryKeys.drawings.list(page, limit),
      queryFn: () => apiFetch<DrawingsListResponse>(`/api/drawing?page=${page}&limit=${limit}`),
      staleTime: 30_000,
      gcTime: 120_000,
      refetchInterval: 30_000
    }),
    topDrawings: (limit = 8) => ({
      queryKey: queryKeys.drawings.top(limit),
      queryFn: () => apiFetch<TopDrawingsResponse>(`/api/drawing/top?limit=${limit}`),
      staleTime: 60_000,
      gcTime: 300_000
    }),
    walletWins: (wallet: string | null | undefined) => ({
      queryKey: queryKeys.drawings.wins(wallet ?? ''),
      queryFn: () => apiFetch<WalletWinsResponse>(`/api/drawing/wins/${wallet}`),
      enabled: Boolean(wallet),
      staleTime: 30_000,
      gcTime: 120_000
    }),
    drawingsByVault: (vault: string, page = 1, limit = 20) => ({
      queryKey: queryKeys.drawings.byVault(vault, page, limit),
      queryFn: () => apiFetch<DrawingsListResponse>(`/api/drawing/${vault}?page=${page}&limit=${limit}`),
      enabled: Boolean(vault),
      staleTime: 30_000,
      gcTime: 120_000
    }),
    // Unpaginated by design — the running average only means anything over every round.
    vaultAprHistory: (vault: string) => ({
      queryKey: queryKeys.drawings.aprHistory(vault),
      queryFn: () => apiFetch<VaultAprHistoryResponse>(`/api/drawing/${vault}/history`),
      enabled: Boolean(vault),
      staleTime: 60_000,
      gcTime: 300_000
    }),
    stats: (params: StatsQueryParams) => ({
      queryKey: queryKeys.stats.list(
        params.interval,
        params.limit ?? 100,
        params.cursor ?? null,
        params.vault ?? null
      ),
      queryFn: () => apiFetch<StatsResponse>(statsPath(params)),
      staleTime: 60_000,
      gcTime: 600_000
    }),
    points: (wallet: string | null | undefined) => ({
      queryKey: queryKeys.points.byWallet(wallet ?? ''),
      queryFn: () => apiFetch<PointsResponse>(`/api/points/${wallet}`),
      enabled: Boolean(wallet),
      staleTime: 30_000,
      gcTime: 120_000
    }),
    pointsLeaderboard: (page = 1, limit = 10, wallet?: string | null) => ({
      queryKey: queryKeys.points.leaderboard(page, limit, wallet ?? ''),
      queryFn: () => apiFetch<LeaderboardResponse>(leaderboardPath(page, limit, wallet)),
      staleTime: 30_000,
      gcTime: 120_000
    }),
    referrals: (wallet: string | null | undefined) => ({
      queryKey: queryKeys.referrals.byWallet(wallet ?? ''),
      queryFn: () => apiFetch<ReferralsResponse>(`/api/referrals?wallet=${wallet}`),
      enabled: Boolean(wallet),
      staleTime: 60_000,
      gcTime: 300_000
    }),
    events: (page = 1, limit = 20) => ({
      queryKey: queryKeys.events.list(page, limit),
      queryFn: () => apiFetch<EventsListResponse>(`/api/events?page=${page}&limit=${limit}`),
      staleTime: 30_000,
      gcTime: 300_000
    }),
    eventDetail: (vault: string, round: number) => ({
      queryKey: queryKeys.events.byVaultRound(vault, round),
      queryFn: () => apiFetch<EventDetailResponse>(`/api/events/${vault}/${round}`),
      enabled: Boolean(vault) && round >= 0,
      staleTime: 300_000,
      gcTime: 600_000
    }),
    drawingProofs: (drawingId: string) => ({
      queryKey: queryKeys.proofs.byDrawing(drawingId),
      queryFn: () => apiFetch<DrawingProofsResponse>(`/api/proofs/${drawingId}`),
      enabled: Boolean(drawingId),
      staleTime: 60_000,
      gcTime: 300_000
    }),
    drawingProofsByVaultRound: (vault: string, round: number) => ({
      queryKey: queryKeys.proofs.byVaultRound(vault, round),
      queryFn: () => apiFetch<DrawingProofsResponse>(`/api/proofs/vault/${vault}/${round}`),
      enabled: Boolean(vault) && round > 0,
      staleTime: 60_000,
      gcTime: 300_000
    }),
    walletProof: (drawingId: string, wallet: string | null | undefined) => ({
      queryKey: queryKeys.proofs.byDrawingWallet(drawingId, wallet ?? ''),
      queryFn: () => apiFetch<WalletProofResponse>(`/api/proofs/${drawingId}/${wallet}`),
      enabled: Boolean(drawingId) && Boolean(wallet),
      staleTime: 60_000,
      gcTime: 300_000
    })
  }
}

export function createApiMutations(apiFetch: ApiFetch) {
  return {
    createReferral: (body: CreateReferralBody) =>
      apiFetch<ReferralSuccessResponse>('/api/referrals', { method: 'POST', body: JSON.stringify(body) }),
    useReferral: (body: UseReferralBody) =>
      apiFetch<ReferralSuccessResponse>('/api/referrals/use', { method: 'POST', body: JSON.stringify(body) }),
    faucet: (wallet: string) =>
      apiFetch<{ signature: string | null }>('/api/faucet', { method: 'POST', body: JSON.stringify({ wallet }) })
  }
}
