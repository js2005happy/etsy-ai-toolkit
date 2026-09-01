// Static cross-border pricing engine. No live FX or marketplace API needed:
// a fixed rate + a per-market markup give a believable landed price, and a
// per-platform fee table shows what each marketplace actually keeps. Numbers
// are approximations for planning, not legal quotes.

export interface Market {
  code: string // two-letter badge + id
  name: string
  currency: string
  symbol: string
  rate: number // 1 USD -> local currency (approximate)
  markup: number // local-market premium (VAT, logistics, purchasing power)
}

export const MARKETS: Market[] = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', rate: 1, markup: 1 },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', symbol: '£', rate: 0.79, markup: 1.05 },
  { code: 'EU', name: 'Eurozone', currency: 'EUR', symbol: '€', rate: 0.92, markup: 1.08 },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$', rate: 1.36, markup: 1.0 },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', rate: 1.52, markup: 1.1 },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', rate: 150, markup: 1.0 },
]

export interface PlatformFee {
  id: string
  name: string
  feePct: number // commission + processing, simplified
  fixed: number // flat fee in USD, converted to local currency
  note: string
}

export const PLATFORM_FEES: PlatformFee[] = [
  { id: 'etsy', name: 'Etsy', feePct: 0.095, fixed: 0.45, note: 'Transaction + payment + listing' },
  { id: 'amazon', name: 'Amazon', feePct: 0.15, fixed: 0.3, note: 'Referral fee (typical category)' },
  { id: 'shopify', name: 'Shopify', feePct: 0.029, fixed: 0.3, note: 'Online card processing' },
  { id: 'ebay', name: 'eBay', feePct: 0.1325, fixed: 0.3, note: 'Final value fee + payment' },
  { id: 'tiktok', name: 'TikTok Shop', feePct: 0.08, fixed: 0.2, note: 'Commission fee' },
  { id: 'own', name: 'Own website', feePct: 0.029, fixed: 0.3, note: 'Payment gateway only' },
]

export interface PlatformQuote {
  id: string
  name: string
  feePct: number
  fixed: number
  fee: number
  net: number
  note: string
}

export interface MarketBreakdown {
  code: string
  name: string
  currency: string
  symbol: string
  rate: number
  markup: number
  localPrice: number
  platforms: PlatformQuote[]
}

export function calculateGlobalPricing(
  basePriceUsd: number,
  marketCodes: string[]
): MarketBreakdown[] {
  const selected = MARKETS.filter((m) => marketCodes.includes(m.code))
  return selected.map((m) => {
    const localPrice = basePriceUsd * m.rate * m.markup
    const platforms = PLATFORM_FEES.map((p) => {
      const fee = localPrice * p.feePct + p.fixed * m.rate
      return {
        id: p.id,
        name: p.name,
        feePct: p.feePct,
        fixed: p.fixed * m.rate,
        fee,
        net: localPrice - fee,
        note: p.note,
      }
    })
    return {
      code: m.code,
      name: m.name,
      currency: m.currency,
      symbol: m.symbol,
      rate: m.rate,
      markup: m.markup,
      localPrice,
      platforms,
    }
  })
}

export function formatMoney(value: number, currency: string, symbol: string): string {
  const decimals = currency === 'JPY' ? 0 : 2
  const n = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${symbol}${n}`
}
