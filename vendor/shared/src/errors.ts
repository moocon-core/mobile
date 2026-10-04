export const API_ERROR_MESSAGES: Record<string, string> = {
  'cannot use your own referral code': "You can't redeem your own referral code",
  'already used a referral code': "You've already redeemed a referral code",
  'create your own referral code before using one': 'Create your own referral code first',
  'wallet already has a referral code': 'You already have a referral code',
  'referral code not found': "That referral code doesn't exist",
  'referral code already taken': 'That code is taken, choose another',
}

export function getFriendlyError(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong'
  try {
    const parsed = JSON.parse(error.message.trim())
    const raw: string = parsed?.error ?? error.message
    if (raw.startsWith('insufficient tickets')) return 'You need at least 100 USDC deposited to create a referral code'
    return API_ERROR_MESSAGES[raw] ?? raw
  } catch {
    return error.message
  }
}

// Backpack closes its popup after approval and throws "Plugin Closed" even though
// the transaction was successfully sent. Treat it as a submitted (not rejected) tx.
export function isPluginClosed(e: Error) {
  return e.message?.toLowerCase().includes('plugin closed')
}

export function isUserRejection(e: Error) {
  const msg = e.message?.toLowerCase() ?? ''
  return msg.includes('user rejected') || msg.includes('cancelled')
}
