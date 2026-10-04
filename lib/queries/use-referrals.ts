import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@moocon/shared'
import { apiMutations, apiQueries } from '@/lib/api'

export function useReferrals(wallet: string | null | undefined) {
  return useQuery(apiQueries.referrals(wallet))
}

export function useCreateReferral() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiMutations.createReferral,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.byWallet(variables.wallet) })
    },
  })
}

export function useUseReferral() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiMutations.useReferral,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.byWallet(variables.wallet) })
      queryClient.invalidateQueries({ queryKey: queryKeys.points.byWallet(variables.wallet) })
    },
  })
}
