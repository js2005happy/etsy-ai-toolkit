import { resolve4, resolve6 } from 'node:dns/promises'
import { isIP } from 'node:net'

const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'
const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_REDIRECTS = 2
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function apiHeaders(accessToken: string, contentType?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': process.env.ETSY_API_KEY!,
  }
  if (contentType) headers['Content-Type'] = contentType
  return headers
}

export function getEtsyRedirectUri(): string {
  return process.env.ETSY_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/etsy/callback`
}

export function buildEtsyAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: getEtsyRedirectUri(),
    scope: 'listings_r listings_w shops_r',
    client_id: process.env.ETSY_API_KEY!,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `https://www.etsy.com/oauth/connect?${params}`
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_API_KEY!,
      redirect_uri: getEtsyRedirectUri(),
      code,
      code_verifier: codeVerifier,
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Etsy token exchange failed', { status: response.status, body: body.slice(0, 500) })
    throw new Error('Etsy authorization failed.')
  }
  const data = await response.json()
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_API_KEY!,
      refresh_token: refreshToken,
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Etsy token refresh failed', { status: response.status, body: body.slice(0, 500) })
    throw new Error('Etsy session refresh failed.')
  }
  const data = await response.json()
  return {
    accessToken: data.access_token as string,
    refreshToken: (data.refresh_token ?? refreshToken) as string,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  }
}

export async function getMyShop(accessToken: string) {
  const me = await fetch(`${ETSY_API_BASE}/users/me`, { headers: apiHeaders(accessToken) })
  if (!me.ok) throw new Error('Unable to identify Etsy user.')
  const user = await me.json()
  const shops = await fetch(`${ETSY_API_BASE}/users/${user.user_id}/shops`, { headers: apiHeaders(accessToken) })
  if (!shops.ok) throw new Error('Unable to load Etsy shop.')
  const data = await shops.json()
  const shop = data.results?.[0]
  if (!shop?.shop_id) throw new Error('No Etsy shop found for this account.')
  return shop
}

export async function getSellerTaxonomyNodes(accessToken: string) {
  const response = await fetch(`${ETSY_API_BASE}/seller-taxonomy/nodes`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error('Unable to load Etsy categories.')
  return response.json()
}

export async function getShopListings(shopId: number, accessToken: string, limit = 100, offset = 0) {
  const params = new URLSearchParams({ limit: String(Math.min(limit, 100)), offset: String(Math.max(offset, 0)) })
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings?${params}`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error('Unable to load Etsy listings.')
  return response.json()
}

export async function getListingImages(listingId: number, accessToken: string) {
  const response = await fetch(`${ETSY_API_BASE}/listings/${listingId}/images`, { headers: apiHeaders(accessToken) })
  if (!response.ok) throw new Error('Unable to load Etsy listing images.')
  return response.json()
}

export async function createListing(
  shopId: number,
  accessToken: string,
  input: {
    title: string
    description: string
    price: number
    quantity: number
    taxonomyId: number
    tags?: string[]
    whoMade?: string
    whenMade?: string
    isSupply?: boolean
  }
): Promise<Record<string, unknown>> {
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings`, {
    method: 'POST',
    headers: apiHeaders(accessToken, 'application/json'),
    body: JSON.stringify({
      quantity: input.quantity,
      title: input.title,
      description: input.description,
      price: input.price,
      who_made: input.whoMade ?? 'i_did',
      when_made: input.whenMade ?? 'made_to_order',
      taxonomy_id: input.taxonomyId,
      is_supply: input.isSupply ?? false,
      should_auto_renew: false,
      tags: input.tags?.slice(0, 13),
      state: 'draft',
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('Etsy draft creation failed', { status: response.status, body: body.slice(0, 500) })
    throw new Error(`Etsy draft creation failed (${response.status})`)
  }
  return response.json()
}

export async function updateListingState(
  shopId: number,
  listingId: number,
  accessToken: string,
  state: 'active' | 'inactive'
): Promise<Record<string, unknown>> {
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}`, {
    method: 'PATCH',
    headers: apiHeaders(accessToken, 'application/json'),
    body: JSON.stringify({ state }),
  })
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
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  )
}

function assertPublicIp(ip: string) {
  const version = isIP(ip)
  if (!version || (version === 4 ? isPrivateIpv4(ip) : isPrivateIpv6(ip))) {
    throw new Error('Remote image host is not allowed.')
  }
}

async function assertSafeRemoteUrl(url: URL) {
  if (url.protocol !== 'https:') throw new Error('Remote listing images must use HTTPS.')
  if (url.username || url.password) throw new Error('Remote image URLs cannot contain credentials.')
  const host = url.hostname.toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error('Remote image host is not allowed.')
  }
  if (isIP(host)) {
    assertPublicIp(host)
    return
  }
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

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined)
      throw new Error('Listing image exceeds the 20 MB limit.')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

async function fetchRemoteImage(source: string): Promise<{ bytes: Uint8Array; type: string }> {
  let current = new URL(source)
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertSafeRemoteUrl(current)
    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      headers: { Accept: 'image/jpeg,image/png,image/webp' },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirect === MAX_REDIRECTS) throw new Error('Too many image redirects.')
      current = new URL(location, current)
      continue
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

export async function uploadListingImage(
  shopId: number,
  listingId: number,
  accessToken: string,
  source: EtsyImageSource,
  rank: number,
  altText?: string,
  sourceMimeType?: string
): Promise<Record<string, unknown>> {
  let bytes: Uint8Array
  let type: string

  if (typeof source === 'string') {
    const remote = await fetchRemoteImage(source)
    bytes = remote.bytes
    type = remote.type
  } else if (source instanceof Blob) {
    type = source.type.toLowerCase()
    if (!IMAGE_TYPES.has(type)) throw new Error('Listing images must be JPEG, PNG, or WebP.')
    if (source.size <= 0 || source.size > MAX_IMAGE_BYTES) throw new Error('Listing image must be between 1 byte and 20 MB.')
    bytes = new Uint8Array(await source.arrayBuffer())
  } else {
    type = (sourceMimeType ?? '').toLowerCase()
    if (!IMAGE_TYPES.has(type)) throw new Error('A valid image MIME type is required for binary uploads.')
    if (source.byteLength <= 0 || source.byteLength > MAX_IMAGE_BYTES) throw new Error('Listing image must be between 1 byte and 20 MB.')
    bytes = source
  }

  const extension = type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
  const imageBuffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(imageBuffer).set(bytes)
  const form = new FormData()
  form.append('image', new Blob([imageBuffer], { type }), `listing-image-${rank}.${extension}`)
  form.append('rank', String(rank))
  if (altText) form.append('alt_text', altText.slice(0, 250))

  let response: Response | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}/images`, {
      method: 'POST',
      headers: apiHeaders(accessToken),
      body: form,
    })
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
