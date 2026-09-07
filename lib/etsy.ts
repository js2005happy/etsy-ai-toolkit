// Etsy Open API v3 client — OAuth 2.0 PKCE + listing push.
// The app is registered at etsy.com/developers (keystring + redirect_uri).
// Etsy v3 uses PKCE (code_verifier + code_challenge S256) — there is no
// client_secret exchange like Shopify.

import crypto from 'crypto'

const ETSY_AUTHORIZE_URL = 'https://www.etsy.com/oauth/connect'
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token'
const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'

const ETSY_SCOPES = 'listings_w listings_r shops_r'

function getEtsyClient() {
  const apiKey = process.env.ETSY_API_KEY
  const redirectUri = process.env.ETSY_REDIRECT_URI
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !redirectUri) {
    throw new Error('Etsy env vars not configured (ETSY_API_KEY / ETSY_REDIRECT_URI)')
  }
  return { apiKey, redirectUri, sharedSecret }
}

// Etsy v3 requires x-api-key: <keystring>:<shared_secret> on every API request
// (since 2026-01-18 the shared secret suffix is mandatory, not just keystring).
function apiHeaders(accessToken: string): Record<string, string> {
  const { apiKey, sharedSecret } = getEtsyClient()
  return {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey,
  }
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(32))
}

export function generateCodeChallenge(verifier: string): string {
  return base64UrlEncode(crypto.createHash('sha256').update(verifier).digest())
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const { apiKey, redirectUri } = getEtsyClient()
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: ETSY_SCOPES,
    client_id: apiKey,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `${ETSY_AUTHORIZE_URL}?${params.toString()}`
}

export interface EtsyToken {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
}

async function requestToken(params: Record<string, string>): Promise<EtsyToken> {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Etsy token exchange failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: Date.now() + expiresIn * 1000,
  }
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<EtsyToken> {
  const { apiKey, redirectUri } = getEtsyClient()
  return requestToken({
    grant_type: 'authorization_code',
    client_id: apiKey,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  })
}

export async function refreshAccessToken(refreshToken: string): Promise<EtsyToken> {
  const { apiKey } = getEtsyClient()
  return requestToken({
    grant_type: 'refresh_token',
    client_id: apiKey,
    refresh_token: refreshToken,
  })
}

export interface EtsyShop {
  shop_id: number
  shop_name: string
}

export async function getUserShops(accessToken: string): Promise<EtsyShop[]> {
  // Etsy v3 access tokens are "<user_id>.<token>"; the user id is the prefix.
  const userId = accessToken.split('.')[0]
  const res = await fetch(`${ETSY_API_BASE}/users/${userId}/shops`, {
    headers: apiHeaders(accessToken),
  })
  if (!res.ok) {
    throw new Error(`Etsy getShops failed (${res.status})`)
  }
  const data = await res.json()
  const shops = (data?.results ?? []) as Array<{ shop_id: number; shop_name: string }>
  return shops.map((s) => ({ shop_id: s.shop_id, shop_name: s.shop_name }))
}

export type EtsyRemoteListing = Record<string, unknown> & { listing_id: number; title?: string; description?: string; state?: string }

export async function getShopListings(shopId: number, accessToken: string, offset = 0): Promise<{ listings: EtsyRemoteListing[]; count: number }> {
  const params = new URLSearchParams({ limit: '100', offset: String(offset), includes: 'Images' })
  const res = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings?${params}`, { headers: apiHeaders(accessToken) })
  if (!res.ok) throw new Error(`Etsy listings request failed (${res.status})`)
  const data = await res.json()
  return { listings: (data?.results ?? []) as EtsyRemoteListing[], count: Number(data?.count ?? 0) }
}

async function getShippingProfileId(shopId: number, accessToken: string): Promise<number | null> {
  const res = await fetch(`${ETSY_API_BASE}/shops/${shopId}/shipping-profiles`, {
    headers: apiHeaders(accessToken),
  })
  if (!res.ok) return null
  const data = await res.json()
  const profiles = (data?.results ?? []) as Array<{ shipping_profile_id: number }>
  return profiles[0]?.shipping_profile_id ?? null
}

export interface EtsyTaxonomyNode {
  id: number
  name: string
  children?: EtsyTaxonomyNode[]
}
export async function getSellerTaxonomy(accessToken: string): Promise<EtsyTaxonomyNode[]> {
  const res = await fetch(`${ETSY_API_BASE}/seller-taxonomy/nodes?limit=100`, {
    headers: apiHeaders(accessToken),
  })
  if (!res.ok) throw new Error(`Etsy taxonomy request failed (${res.status})`)
  const data = await res.json()
  return (data?.results ?? []) as EtsyTaxonomyNode[]
}

export interface EtsyListingInput {
  title: string
  description: string
  price: number
  quantity?: number
  who_made?: string
  when_made?: string
  type?: string
  taxonomyId?: number
  images?: string[]
  tags?: string[]
}

export async function createListing(
  shopId: number,
  accessToken: string,
  input: EtsyListingInput
): Promise<Record<string, any>> {
  const shippingProfileId = await getShippingProfileId(shopId, accessToken)
  if (!shippingProfileId) {
    throw new Error('No shipping profile found for this shop. Create one in Etsy first.')
  }

  if (!input.taxonomyId) {
    throw new Error('A confirmed Etsy taxonomy category is required before creating a draft.')
  }

  const body: Record<string, any> = {
    quantity: input.quantity ?? 999,
    title: input.title,
    description: input.description,
    price: input.price,
    who_made: input.who_made ?? 'i_did',
    when_made: input.when_made ?? 'made_to_order',
    taxonomy_id: input.taxonomyId,
    shipping_profile_id: shippingProfileId,
    type: input.type ?? 'physical',
    ...(input.tags?.length ? { tags: input.tags.slice(0, 13) } : {}),
  }

  const res = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...apiHeaders(accessToken),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error ?? JSON.stringify(data)
    throw new Error(`Etsy listing create failed (${res.status}): ${msg}`)
  }

  // Etsy uploads images via a separate multipart endpoint after the draft exists.
  if (input.images && input.images.length) {
    const listingId = data.listing_id as number
    for (const [rank, src] of Array.from(input.images.slice(0, 10).entries())) {
      await uploadListingImage(shopId, listingId, accessToken, src, rank + 1)
    }
  }

  return data
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function uploadListingImage(
  shopId: number,
  listingId: number,
  accessToken: string,
  source: string,
  rank: number,
  altText?: string
): Promise<Record<string, unknown>> {
  const image = await fetch(source)
  if (!image.ok) throw new Error(`Unable to download listing image (${image.status})`)
  const type = image.headers.get('content-type')?.split(';')[0].toLowerCase() ?? ''
  if (!IMAGE_TYPES.has(type)) throw new Error('Listing images must be JPEG, PNG, or WebP.')
  const bytes = await image.arrayBuffer()
  if (bytes.byteLength === 0 || bytes.byteLength > 20 * 1024 * 1024) {
    throw new Error('Listing image must be between 1 byte and 20 MB.')
  }
  const extension = type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
  const form = new FormData()
  form.append('image', new Blob([bytes], { type }), `listing-image-${rank}.${extension}`)
  form.append('rank', String(rank))
  if (altText) form.append('alt_text', altText.slice(0, 250))

  let response: Response | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}/images`, {
      method: 'POST', headers: apiHeaders(accessToken), body: form,
    })
    if (response.ok || (response.status !== 429 && response.status < 500)) break
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt))
  }
  if (!response?.ok) throw new Error(`Etsy image upload failed (${response?.status ?? 500})`)
  return response.json()
}
