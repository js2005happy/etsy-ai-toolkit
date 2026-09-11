const EBAY_API_BASE = process.env.EBAY_ENV === 'sandbox' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com'
const EBAY_AUTH_BASE = process.env.EBAY_ENV === 'sandbox' ? 'https://auth.sandbox.ebay.com' : 'https://auth.ebay.com'
const REQUEST_TIMEOUT_MS = 15_000

export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
]

function config() {
  const clientId = process.env.EBAY_CLIENT_ID
  const clientSecret = process.env.EBAY_CLIENT_SECRET
  const redirectUriName = process.env.EBAY_REDIRECT_URI_NAME
  if (!clientId || !clientSecret || !redirectUriName) throw new Error('eBay OAuth env vars are not configured')
  return { clientId, clientSecret, redirectUriName }
}

async function timedFetch(url: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try { return await fetch(url, { ...init, cache: 'no-store', signal: controller.signal }) }
  finally { clearTimeout(timer) }
}

export function buildEbayAuthorizeUrl(state: string): string {
  const { clientId, redirectUriName } = config()
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUriName, response_type: 'code', scope: EBAY_SCOPES.join(' '), state })
  return `${EBAY_AUTH_BASE}/oauth2/authorize?${params.toString()}`
}

export type EbayTokenSet = { accessToken: string; refreshToken?: string; expiresIn: number; refreshTokenExpiresIn?: number }

async function tokenRequest(params: URLSearchParams): Promise<EbayTokenSet> {
  const { clientId, clientSecret } = config()
  const res = await timedFetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error_description || data?.error || `eBay token request failed (${res.status})`)
  if (!data?.access_token) throw new Error('eBay token response did not include an access token')
  return { accessToken: String(data.access_token), refreshToken: data.refresh_token ? String(data.refresh_token) : undefined, expiresIn: Number(data.expires_in || 7200), refreshTokenExpiresIn: data.refresh_token_expires_in ? Number(data.refresh_token_expires_in) : undefined }
}

export function exchangeEbayCode(code: string): Promise<EbayTokenSet> {
  const { redirectUriName } = config()
  return tokenRequest(new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUriName }))
}

export function refreshEbayToken(refreshToken: string): Promise<EbayTokenSet> {
  return tokenRequest(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, scope: EBAY_SCOPES.join(' ') }))
}

async function ebayApi(accessToken: string, path: string, init: RequestInit = {}) {
  if (!accessToken) throw new Error('Missing eBay access token')
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  headers.set('Content-Type', 'application/json')
  if (!headers.has('Content-Language')) headers.set('Content-Language', 'en-US')
  return timedFetch(`${EBAY_API_BASE}${path}`, { ...init, headers })
}

export async function getEbayUser(accessToken: string): Promise<any> {
  const res = await ebayApi(accessToken, '/commerce/identity/v1/user/', { method: 'GET' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `eBay identity request failed (${res.status})`)
  return data
}

export type EbayInventoryInput = { sku: string; title: string; description: string; quantity: number; condition?: string; imageUrls?: string[]; aspects?: Record<string, string[]> }

export async function putEbayInventoryItem(accessToken: string, input: EbayInventoryInput): Promise<void> {
  if (!input.sku?.trim()) throw new Error('eBay publishing requires a stable SKU')
  if (!Number.isInteger(input.quantity) || input.quantity < 0) throw new Error('eBay quantity must be a non-negative integer')
  const payload = {
    availability: { shipToLocationAvailability: { quantity: input.quantity } },
    condition: input.condition || 'NEW',
    product: { title: input.title.slice(0, 80), description: input.description, imageUrls: (input.imageUrls || []).filter((url) => /^https:\/\//i.test(url)).slice(0, 12), aspects: input.aspects || {} },
  }
  const res = await ebayApi(accessToken, `/sell/inventory/v1/inventory_item/${encodeURIComponent(input.sku)}`, { method: 'PUT', body: JSON.stringify(payload) })
  if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.errors?.[0]?.message || `eBay inventory item update failed (${res.status})`) }
}

export type EbayOfferInput = {
  sku: string
  marketplaceId: string
  categoryId: string
  merchantLocationKey: string
  quantity: number
  price: { value: string; currency: string }
  fulfillmentPolicyId: string
  paymentPolicyId: string
  returnPolicyId: string
}

export async function createEbayOffer(accessToken: string, input: EbayOfferInput): Promise<string> {
  const res = await ebayApi(accessToken, '/sell/inventory/v1/offer', {
    method: 'POST',
    headers: { 'Content-Language': input.marketplaceId === 'EBAY_GB' ? 'en-GB' : 'en-US' },
    body: JSON.stringify({
      sku: input.sku,
      marketplaceId: input.marketplaceId,
      format: 'FIXED_PRICE',
      availableQuantity: Math.max(0, Math.trunc(input.quantity)),
      categoryId: input.categoryId,
      merchantLocationKey: input.merchantLocationKey,
      pricingSummary: { price: input.price },
      listingPolicies: { fulfillmentPolicyId: input.fulfillmentPolicyId, paymentPolicyId: input.paymentPolicyId, returnPolicyId: input.returnPolicyId },
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `eBay offer creation failed (${res.status})`)
  if (!data?.offerId) throw new Error('eBay offer creation returned no offer id')
  return String(data.offerId)
}

export async function publishEbayOffer(accessToken: string, offerId: string): Promise<{ listingId: string }> {
  const res = await ebayApi(accessToken, `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`, { method: 'POST', body: '{}' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `eBay offer publish failed (${res.status})`)
  if (!data?.listingId) throw new Error('eBay publish returned no listing id')
  return { listingId: String(data.listingId) }
}

export async function updateEbayPriceQuantity(accessToken: string, input: { sku: string; offerId: string; quantity?: number; price?: number; currency?: string }): Promise<void> {
  const sku = input.sku.trim()
  const offerId = input.offerId.trim()
  if (!sku || !offerId) throw new Error('eBay synchronization requires both SKU and offer id')
  if (input.quantity != null && (!Number.isInteger(input.quantity) || input.quantity < 0)) throw new Error('eBay quantity must be a non-negative integer')
  if (input.price != null && (!Number.isFinite(input.price) || input.price < 0 || !input.currency)) throw new Error('eBay price sync requires a non-negative price and currency')
  if (input.quantity == null && input.price == null) throw new Error('No eBay inventory or price change supplied')

  const offer: Record<string, unknown> = { offerId }
  if (input.quantity != null) offer.availableQuantity = input.quantity
  if (input.price != null) offer.price = { value: input.price.toFixed(2), currency: String(input.currency).toUpperCase() }
  const request: Record<string, unknown> = { sku, offers: [offer] }
  if (input.quantity != null) request.shipToLocationAvailability = { quantity: input.quantity }

  const res = await ebayApi(accessToken, '/sell/inventory/v1/bulk_update_price_quantity', { method: 'POST', body: JSON.stringify({ requests: [request] }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `eBay inventory synchronization failed (${res.status})`)
  const responses = Array.isArray(data?.responses) ? data.responses : []
  const failed = responses.find((item: any) => Number(item?.statusCode || 200) >= 400 || (Array.isArray(item?.errors) && item.errors.length))
  if (failed) throw new Error(failed?.errors?.[0]?.message || `eBay inventory synchronization failed (${failed.statusCode})`)
}

export async function listEbayOrders(accessToken: string, options: { createdAtMin?: string; limit?: number } = {}): Promise<any[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200)
  const params = new URLSearchParams({ limit: String(limit), offset: '0' })
  if (options.createdAtMin) params.set('filter', `creationdate:[${options.createdAtMin}..]`)
  const res = await ebayApi(accessToken, `/sell/fulfillment/v1/order?${params.toString()}`, { method: 'GET' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `eBay orders request failed (${res.status})`)
  if (!Array.isArray(data?.orders)) throw new Error('eBay orders response was invalid')
  return data.orders
}
