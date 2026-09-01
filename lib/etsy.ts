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
  if (!apiKey || !redirectUri) {
    throw new Error('Etsy env vars not configured (ETSY_API_KEY / ETSY_REDIRECT_URI)')
  }
  return { apiKey, redirectUri }
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
  const res = await fetch(`${ETSY_API_BASE}/shops`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`Etsy getShops failed (${res.status})`)
  }
  const data = await res.json()
  const shops = (data?.results ?? []) as Array<{ shop_id: number; shop_name: string }>
  return shops.map((s) => ({ shop_id: s.shop_id, shop_name: s.shop_name }))
}

async function getShippingProfileId(shopId: number, accessToken: string): Promise<number | null> {
  const res = await fetch(`${ETSY_API_BASE}/shops/${shopId}/shipping-profiles`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  const profiles = (data?.results ?? []) as Array<{ shipping_profile_id: number }>
  return profiles[0]?.shipping_profile_id ?? null
}

interface TaxNode {
  id: number
  name: string
  children?: TaxNode[]
}

function findLeafId(nodes: TaxNode[], predicate: (name: string) => boolean): number | null {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const found = findLeafId(node.children, predicate)
      if (found) return found
    } else if (predicate(node.name ?? '')) {
      return node.id
    }
  }
  return null
}

// Best-effort: walk the seller taxonomy for a leaf node whose name matches a
// word in the title. Returns null when nothing matches — the caller should
// then surface a clear error so the user can pass taxonomy_id explicitly.
async function findTaxonomyId(title: string, accessToken: string): Promise<number | null> {
  const res = await fetch(`${ETSY_API_BASE}/seller-taxonomy/nodes?limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  const nodes = (data?.results ?? []) as TaxNode[]
  const needles = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
  return findLeafId(nodes, (name) => needles.some((n) => name.toLowerCase().includes(n)))
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

  let taxonomyId: number | null | undefined = input.taxonomyId
  if (!taxonomyId) {
    taxonomyId = await findTaxonomyId(input.title, accessToken)
  }
  if (!taxonomyId) {
    throw new Error(
      'Could not determine a listing category. Pass taxonomy_id or set up the Etsy shop taxonomy.'
    )
  }

  const body: Record<string, any> = {
    quantity: input.quantity ?? 999,
    title: input.title,
    description: input.description,
    price: input.price,
    who_made: input.who_made ?? 'i_did',
    when_made: input.when_made ?? 'made_to_order',
    taxonomy_id: taxonomyId,
    shipping_profile_id: shippingProfileId,
    type: input.type ?? 'physical',
  }

  const res = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error ?? JSON.stringify(data)
    throw new Error(`Etsy listing create failed (${res.status}): ${msg}`)
  }

  // Etsy uploads images via a separate endpoint after the listing exists.
  if (input.images && input.images.length) {
    const listingId = data.listing_id as number
    for (const src of input.images.slice(0, 10)) {
      try {
        await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ image: src }),
        })
      } catch {
        // Non-fatal: a missing image shouldn't fail the whole push.
      }
    }
  }

  return data
}
