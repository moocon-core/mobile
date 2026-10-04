import { useQuery } from '@tanstack/react-query'
import { apiQueries } from '@/lib/api'

export function useDrawings(page = 1, limit = 20) {
  return useQuery(apiQueries.drawings(page, limit))
}

export function useTopDrawings(limit = 8) {
  return useQuery(apiQueries.topDrawings(limit))
}

export function useWalletWins(wallet: string | null | undefined) {
  return useQuery(apiQueries.walletWins(wallet))
}

export function useDrawingsByVault(vault: string, page = 1, limit = 20) {
  return useQuery(apiQueries.drawingsByVault(vault, page, limit))
}

export function useVaultAprHistory(vault: string) {
  return useQuery(apiQueries.vaultAprHistory(vault))
}
