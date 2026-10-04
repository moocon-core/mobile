import { numberFormat } from './intl'
export type VaultFormTab = 'deposit' | 'withdraw'

export function formatTokenBalance(amount: number, decimals: number): string {
  if (!Number.isFinite(amount)) return '0'
  return numberFormat({ minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(amount)
}

export function trimDecimals(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '0'
  return parseFloat(value.toFixed(decimals)).toString()
}

/** True when `value` is a partial decimal the amount field should accept. */
export function isValidAmountInput(value: string, decimals: number): boolean {
  if (value === '') return true
  if (!/^\d*\.?\d*$/.test(value)) return false
  const dot = value.indexOf('.')
  return dot === -1 || value.length - dot - 1 <= decimals
}

export interface VaultFormInput {
  tab: VaultFormTab
  connected: boolean
  /** Typed amount, as a display number. */
  amount: number
  isMaxWithdraw: boolean
  solShortfall: boolean
  depositable: number
  deposited: number
  minDeposit: number
  decimals: number
  symbol: string
}

/** The one message to show under the amount field, or '' when it is valid. */
export function vaultFormError(f: VaultFormInput): string {
  if (f.tab === 'deposit') {
    // Shown before anything is typed — the wallet cannot cover the fees at all.
    if (f.connected && f.solShortfall) return 'Insufficient SOL, keep at least 0.02 SOL'
    if (f.amount > 0 && f.amount > f.depositable) return 'Insufficient balance'
    if (f.amount > 0 && f.amount < f.minDeposit)
      return `Minimum deposit: ${formatTokenBalance(f.minDeposit, f.decimals)} ${f.symbol}`
    return ''
  }
  if (f.amount > 0 && !f.isMaxWithdraw && f.amount > f.deposited) return 'Insufficient deposited amount'
  return ''
}

export function canSubmitVaultForm(f: VaultFormInput, pending: boolean): boolean {
  return f.connected && (f.amount > 0 || f.isMaxWithdraw) && !vaultFormError(f) && !pending
}

export function toSafeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0
}
