import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { StatsQueryParams } from '@moocon/shared'
import { apiQueries } from '@/lib/api'

// Switching interval keeps the old series on screen until the new one lands, instead of flashing a skeleton.
export function useStats(params: StatsQueryParams) {
  return useQuery({ ...apiQueries.stats(params), placeholderData: keepPreviousData })
}
