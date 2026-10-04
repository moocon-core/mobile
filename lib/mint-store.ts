import { useQuery } from '@tanstack/react-query'
import { createMintStore, queryKeys } from '@moocon/shared'
import { apiFetch } from '@/lib/api'

export const useMintStore = createMintStore(apiFetch)

/** Loads mint metadata into the store through React Query, for retries and an error state. */
export function useMintData() {
  return useQuery({
    queryKey: queryKeys.mintData.all(),
    queryFn: async () => {
      await useMintStore.getState().fetchMints()
      return true
    },
    staleTime: Infinity,
  })
}
