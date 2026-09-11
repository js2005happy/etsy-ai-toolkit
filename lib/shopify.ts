// Shopify Admin API client — OAuth install + product push.
// Credentials stay server-side in env vars. All shop domains are normalized
// before use so user-controlled input cannot become an arbitrary fetch target.

const SHOPIFY_API_VERSION = '2026-07'
const SHOPIFY_SCOPE = 'write_products,read_products'
const REQUEST_TIMEOUT_MS = 15_000

function getShopifyClient() {
  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Shopify env vars not configured (SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET / SHOPIFY_REDIRECT_URI)')
  }
  return { clientId, clientSecret, redirectUri }
}

export function normalizeShopDomain(input: string): string {
  const value = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value)) {
    throw new Error('Invalid Shopify shop domain')
  }
  return value
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function shopifyFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timeout)
  }
}

export function buildInstallUrl(shopInput: string, state: string): string {
  const shop = normalizeShopDomain(shopInput)
  const { clientId, redirectUri } = getShopifyClient()
  const params = new URLSearchParams({
    client_id: clientId,
    scope: SHOPIFY_SCOPE,
    redirect_uri: redirectUri,
    state,
  })
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`
}

export async function exchangeToken(
  shopInput: string,
  code: string
): Promise<{ accessToken: string; scopes: string }> {
  const shop = normalizeShopDomain(shopInput)
  if (!code?.trim()) throw new Error('Missing Shopify authorization code')
  const { clientId, clientSecret } = getShopifyClient()
  const res = await shopifyFetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  if (!res.ok) throw new Error(`Shopify token exchange failed (${res.status})`)
  const data = await res.json()
  if (!data?.access_token) throw new Error('Shopify token exchange returned no access token')
  return { accessToken: String(data.access_token), scopes: String(data.scope || '') }
}

export interface ShopifyProductInput {
  title: string
  description?: string
  tags?: string[]
  price?: string
  sku?: string
  inventoryQuantity?: number
  vendor?: string
  productType?: string
  images?: string[]
  status?: 'draft' | 'active'
}

export async function createProduct(
  shopInput: string,
  accessToken: string,
  input: ShopifyProductInput
): Promise<Record<string, any>> {
  const shop = normalizeShopDomain(shopInput)
  if (!accessToken?.trim()) throw new Error('Missing Shopify access token')
  if (!input.title?.trim()) throw new Error('Product title is required')

  const body: Record<string, any> = {
    title: input.title.trim().slice(0, 255),
    status: input.status ?? 'draft',
  }
  if (input.description) {
    body.body_html = `<p>${escapeHtml(input.description).replace(/\n/g, '<br/>')}</p>`
  }
  if (input.tags?.length) body.tags = input.tags.slice(0, 50).join(', ')
  if (input.vendor) body.vendor = input.vendor.slice(0, 255)
  if (input.productType) body.product_type = input.productType.slice(0, 255)
  if (input.images?.length) {
    body.images = input.images
      .filter((src) => /^https:\/\//i.test(src))
      .slice(0, 10)
      .map((src) => ({ src }))
  }

  const variant: Record<string, any> = {
    price: input.price ? String(input.price) : '0.00',
  }
  if (input.sku) variant.sku = input.sku.slice(0, 255)
  if (Number.isInteger(input.inventoryQuantity) && Number(input.inventoryQuantity) >= 0) {
    variant.inventory_management = 'shopify'
    variant.inventory_quantity = Number(input.inventoryQuantity)
  }
  body.variants = [variant]

  const res = await shopifyFetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ product: body }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.errors ? JSON.stringify(data.errors) : `Shopify product create failed (${res.status})`
    throw new Error(msg)
  }
  if (!data?.product?.id) throw new Error('Shopify product create returned no product id')
  return data.product
}
