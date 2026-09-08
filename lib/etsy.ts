// Etsy Open API v3 client — OAuth 2.0 PKCE + draft-first publishing.
// Keep legacy export names stable because existing routes depend on them.

import crypto from 'crypto'
import { resolve4, resolve6 } from 'node:dns/promises'
import { isIP } from 'node:net'

const ETSY_AUTHORIZE_URL = 'https://www.etsy.com/oauth/connect'
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token'
const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'
const ETSY_SCOPES = 'listings_w listings_r shops_r'
const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_REDIRECTS = 2
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function getEtsyClient() {
  const apiKey = process.env.ETSY_API_KEY
  const redirectUri = process.env.ETSY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/etsy/callback`
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !redirectUri) throw new Error('Etsy env vars not configured (ETSY_API_KEY / ETSY_REDIRECT_URI)')
  return { apiKey, redirectUri, sharedSecret }
}

function apiHeaders(accessToken: string, contentType?: string): Record<string, string> {
  const { apiKey, sharedSecret } = getEtsyClient()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey,
  }
  if (contentType) headers['Content-Type'] = contentType
  return headers
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function getEtsyRedirectUri(): string { return getEtsyClient().redirectUri }
export function generateCodeVerifier(): string { return base64UrlEncode(crypto.randomBytes(32)) }
export function generateCodeChallenge(verifier: string): string { return base64UrlEncode(crypto.createHash('sha256').update(verifier).digest()) }

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const { apiKey, redirectUri } = getEtsyClient()
  const params = new URLSearchParams({ response_type: 'code', redirect_uri: redirectUri, scope: ETSY_SCOPES, client_id: apiKey, state, code_challenge: codeChallenge, code_challenge_method: 'S256' })
  return `${ETSY_AUTHORIZE_URL}?${params.toString()}`
}
export const buildEtsyAuthorizeUrl = buildAuthorizeUrl

export interface EtsyToken { accessToken: string; refreshToken: string; expiresAt: number }
async function requestToken(params: Record<string, string>): Promise<EtsyToken> {
  const response = await fetch(ETSY_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params).toString() })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Etsy token request failed', { status: response.status, body: body.slice(0, 500) })
    throw new Error('Etsy authorization failed.')
  }
  const data = await response.json()
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600
  return { accessToken: data.access_token as string, refreshToken: data.refresh_token as string, expiresAt: Date.now() + expiresIn * 1000 }
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<EtsyToken> {
  const { apiKey, redirectUri } = getEtsyClient()
  return requestToken({ grant_type: 'authorization_code', client_id: apiKey, redirect_uri: redirectUri, code, code_verifier: codeVerifier })
}
export const exchangeCodeForTokens = exchangeCode
export async function refreshAccessToken(refreshToken: string): Promise<EtsyToken> {
  const { apiKey } = getEtsyClient()
  return requestToken({ grant_type: 'refresh_token', client_id: apiKey, refresh_token: refreshToken })
}

export interface EtsyShop { shop_id: number; shop_name: string }
export async function getUserShops(accessToken: string): Promise<EtsyShop[]> {
  const userId = accessToken.split('.')[0]
  if (!/^\d+$/.test(userId)) throw new Error('Unable to identify Etsy user.')
  const response = await fetch(`${ETSY_API_BASE}/users/${userId}/shops`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error(`Etsy shop lookup failed (${response.status})`)
  const data = await response.json()
  const shops = (data?.results ?? []) as Array<{ shop_id: number; shop_name: string }>
  return shops.filter((shop) => Number.isSafeInteger(shop.shop_id) && shop.shop_id > 0).map((shop) => ({ shop_id: shop.shop_id, shop_name: String(shop.shop_name ?? '') }))
}
export async function getMyShop(accessToken: string): Promise<EtsyShop> {
  const shops = await getUserShops(accessToken)
  if (!shops[0]) throw new Error('No Etsy shop found for this account.')
  return shops[0]
}

export type EtsyRemoteListing = Record<string, unknown> & { listing_id: number; title?: string; description?: string; state?: string }
export async function getShopListings(shopId: number, accessToken: string, offset = 0): Promise<{ listings: EtsyRemoteListing[]; count: number }> {
  const params = new URLSearchParams({ limit: '100', offset: String(Math.max(0, offset)), includes: 'Images' })
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings?${params}`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error(`Etsy listings request failed (${response.status})`)
  const data = await response.json()
  return { listings: (data?.results ?? []) as EtsyRemoteListing[], count: Number(data?.count ?? 0) }
}

async function getShippingProfileId(shopId: number, accessToken: string): Promise<number | null> {
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/shipping-profiles`, { headers: apiHeaders(accessToken) })
  if (!response.ok) return null
  const data = await response.json()
  const profiles = (data?.results ?? []) as Array<{ shipping_profile_id: number }>
  return profiles[0]?.shipping_profile_id ?? null
}

export interface EtsyTaxonomyNode { id: number; name: string; children?: EtsyTaxonomyNode[] }
export async function getSellerTaxonomy(accessToken: string): Promise<EtsyTaxonomyNode[]> {
  const response = await fetch(`${ETSY_API_BASE}/seller-taxonomy/nodes?limit=100`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error(`Etsy taxonomy request failed (${response.status})`)
  const data = await response.json()
  return (data?.results ?? []) as EtsyTaxonomyNode[]
}
export const getSellerTaxonomyNodes = getSellerTaxonomy

export interface EtsyListingInput {
  title: string; description: string; price: number; quantity?: number; who_made?: string; when_made?: string; type?: string; taxonomyId?: number; images?: string[]; tags?: string[]
}
export async function createListing(shopId: number, accessToken: string, input: EtsyListingInput): Promise<Record<string, unknown>> {
  const shippingProfileId = await getShippingProfileId(shopId, accessToken)
  if (!shippingProfileId) throw new Error('No shipping profile found for this shop. Create one in Etsy first.')
  if (!input.taxonomyId || !Number.isSafeInteger(input.taxonomyId)) throw new Error('A confirmed Etsy taxonomy category is required before creating a draft.')
  const body: Record<string, unknown> = {
    quantity: input.quantity ?? 1, title: input.title, description: input.description, price: input.price,
    who_made: input.who_made ?? 'i_did', when_made: input.when_made ?? 'made_to_order', taxonomy_id: input.taxonomyId,
    shipping_profile_id: shippingProfileId, type: input.type ?? 'physical', ...(input.tags?.length ? { tags: input.tags.slice(0, 13) } : {}),
  }
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings`, { method: 'POST', headers: apiHeaders(accessToken, 'application/json'), body: JSON.stringify(body) })
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    console.error('Etsy draft creation failed', { status: response.status, data })
    throw new Error(`Etsy draft creation failed (${response.status})`)
  }
  return data
}

export async function getListingImages(listingId: number, accessToken: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${ETSY_API_BASE}/listings/${listingId}/images`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error(`Unable to load Etsy listing images (${response.status})`)
  return response.json()
}
export async function updateListingState(shopId: number, listingId: number, accessToken: string, state: 'active' | 'inactive'): Promise<Record<string, unknown>> {
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}`, { method: 'PATCH', headers: apiHeaders(accessToken, 'application/json'), body: JSON.stringify({ state }) })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Etsy listing state update failed', { listingId, state, status: response.status, body: body.slice(0, 500) })
    throw new Error(`Etsy listing update failed (${response.status})`)
  }
  return response.json()
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return true
  const [a, b] = parts
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
}
function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  return normalized === '::' || normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')
}
function assertPublicIp(ip: string) {
  const version = isIP(ip)
  if (!version || (version === 4 ? isPrivateIpv4(ip) : isPrivateIpv6(ip))) throw new Error('Remote image host is not allowed.')
}
async function assertSafeRemoteUrl(url: URL) {
  if (url.protocol !== 'https:') throw new Error('Remote listing images must use HTTPS.')
  if (url.username || url.password) throw new Error('Remote image URLs cannot contain credentials.')
  const host = url.hostname.toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) throw new Error('Remote image host is not allowed.')
  if (isIP(host)) { assertPublicIp(host); return }
  const addresses = new Set<string>()
  const [v4, v6] = await Promise.allSettled([resolve4(host), resolve6(host)])
  if (v4.status === 'fulfilled') v4.value.forEach((ip) => addresses.add(ip))
  if (v6.status === 'fulfilled') v6.value.forEach((ip) => addresses.add(ip))
  if (addresses.size === 0) throw new Error('Remote image host could not be resolved.')
  addresses.forEach(assertPublicIp)
}
async function readResponseWithLimit(response: Response, maxBytes: number): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get('content-length') ?? 0)
  if (declaredLength > maxBytes) throw new Error('Listing image exceeds the 20 MB limit.')
  if (!response.body) {
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > maxBytes) throw new Error('Listing image exceeds the 20 MB limit.')
    return new Uint8Array(buffer)
  }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let total = 0
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    total += value.byteLength
    if (total > maxBytes) { await reader.cancel().catch(() => undefined); throw new Error('Listing image exceeds the 20 MB limit.') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total); let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}
async function fetchRemoteImage(source: string): Promise<{ bytes: Uint8Array; type: string }> {
  let current = new URL(source)
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertSafeRemoteUrl(current)
    const response = await fetch(current, { method: 'GET', redirect: 'manual', headers: { Accept: 'image/jpeg,image/png,image/webp' } })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirect === MAX_REDIRECTS) throw new Error('Too many image redirects.')
      current = new URL(location, current); continue
    }
    if (!response.ok) throw new Error(`Unable to download listing image (${response.status})`)
    const type = response.headers.get('content-type')?.split(';')[0].toLowerCase() ?? ''
    if (!IMAGE_TYPES.has(type)) throw new Error('Listing images must be JPEG, PNG, or WebP.')
    const bytes = await readResponseWithLimit(response, MAX_IMAGE_BYTES)
    if (bytes.byteLength === 0) throw new Error('Listing image is empty.')
    return { bytes, type }
  }
  throw new Error('Unable to download listing image.')
}

export type EtsyImageSource = string | Blob | Uint8Array
export async function uploadListingImage(shopId: number, listingId: number, accessToken: string, source: EtsyImageSource, rank: number, altText?: string, sourceMimeType?: string): Promise<Record<string, unknown>> {
  let bytes: Uint8Array; let type: string
  if (typeof source === 'string') { const remote = await fetchRemoteImage(source); bytes = remote.bytes; type = remote.type }
  else if (source instanceof Blob) {
    type = source.type.toLowerCase(); if (!IMAGE_TYPES.has(type)) throw new Error('Listing images must be JPEG, PNG, or WebP.')
    if (source.size <= 0 || source.size > MAX_IMAGE_BYTES) throw new Error('Listing image must be between 1 byte and 20 MB.')
    bytes = new Uint8Array(await source.arrayBuffer())
  } else {
    type = (sourceMimeType ?? '').toLowerCase(); if (!IMAGE_TYPES.has(type)) throw new Error('A valid image MIME type is required for binary uploads.')
    if (source.byteLength <= 0 || source.byteLength > MAX_IMAGE_BYTES) throw new Error('Listing image must be between 1 byte and 20 MB.')
    bytes = source
  }
  const extension = type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
  const imageBuffer = new ArrayBuffer(bytes.byteLength); new Uint8Array(imageBuffer).set(bytes)
  const form = new FormData(); form.append('image', new Blob([imageBuffer], { type }), `listing-image-${rank}.${extension}`); form.append('rank', String(rank))
  if (altText) form.append('alt_text', altText.slice(0, 250))
  let response: Response | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}/images`, { method: 'POST', headers: apiHeaders(accessToken), body: form })
    if (response.ok || (response.status !== 429 && response.status < 500)) break
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt))
  }
  if (!response?.ok) {
    const body = await response?.text().catch(() => '')
    console.error('Etsy image upload failed', { listingId, rank, status: response?.status, body: body?.slice(0, 500) })
    throw new Error(`Etsy image upload failed (${response?.status ?? 500})`)
  }
  return response.json()
}
