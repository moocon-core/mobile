import { createApiClient, createApiMutations, createApiQueries } from '@moocon/shared'

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.moocon.xyz').replace(/\/+$/, '')
export const { apiFetch } = createApiClient(API_BASE_URL)
export const apiQueries = createApiQueries(apiFetch)
export const apiMutations = createApiMutations(apiFetch)
