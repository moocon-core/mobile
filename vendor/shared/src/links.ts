import { getMagicblockEndpoints, REFERRAL_CODE_MAX_LENGTH } from './sdk'

export const magicblockErUrl = (isDevnet: boolean) =>
  getMagicblockEndpoints(isDevnet ? 'devnet' : 'mainnet').er

export function solscanUrl(
  path: string,
  isDevnet: boolean,
  erUrl?: string
): string {
  const base = 'https://solscan.io'
  if (erUrl)
    return `${base}${path}?cluster=custom&customUrl=${encodeURIComponent(erUrl)}`
  const cluster = isDevnet ? '?cluster=devnet' : ''
  return `${base}${path}${cluster}`
}

export function sanitizeReferralCode(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').slice(0, REFERRAL_CODE_MAX_LENGTH)
}

export function getReferralCodeFromSearch(search: string): string {
  return sanitizeReferralCode(new URLSearchParams(search).get('ref') ?? '')
}

export function getReferralLink(origin: string, code: string): string {
  const url = new URL('/portfolio', origin)
  url.searchParams.set('ref', sanitizeReferralCode(code))
  return url.toString()
}
