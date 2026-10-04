// Hermes constructs Intl formatters slowly (~5ms, vs 0.05ms to reuse one), so share one per option set.
const cache = new Map<string, Intl.NumberFormat>()

export function numberFormat(options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = JSON.stringify(options)
  let nf = cache.get(key)
  if (!nf) {
    nf = new Intl.NumberFormat('en-US', options)
    cache.set(key, nf)
  }
  return nf
}
