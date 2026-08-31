// Shopify Admin API client — OAuth install + product push.
// The app is registered on dev.shopify.com (org 5154414, app 417583169537).
// Credentials live in env vars so they never hit the client bundle.

const SHOPIFY_API_VERSION = '2026-07'
const SHOPIFY_SCOPE = 'write_products,read_products'

function getShopifyClient() {
  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Shopify env vars not configured (SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET / SHOPIFY_REDIRECT_URI)')
  }
  return { clientId, clientSecret, redirectUri }
}

export function buildInstallUrl(shop: string, state: string): string {
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
  shop: string,
  code: string
): Promise<{ accessToken: string; scopes: string }> {
  const { clientId, clientSecret } = getShopifyClient()
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  if (!res.ok) {
    throw new Error(`Shopify token exchange failed (${res.status})`)
  }
  const data = await res.json()
  return { accessToken: data.access_token as string, scopes: data.scope as string }
}

export interface ShopifyProductInput {
  title: string
  description?: string
  tags?: string[]
  price?: string
  images?: string[]
  status?: 'draft' | 'active'
}

export async function createProduct(
  shop: string,
  accessToken: string,
  input: ShopifyProductInput
): Promise<Record<string, any>> {
  const body: Record<string, any> = {
    title: input.title,
    status: input.status ?? 'draft',
  }
  if (input.description) {
    body.body_html = `<p>${input.description.replace(/\n/g, '<br/>')}</p>`
  }
  if (input.tags && input.tags.length) {
    body.tags = input.tags.join(', ')
  }
  if (input.images && input.images.length) {
    body.images = input.images.slice(0, 10).map((src) => ({ src }))
  }
  body.variants = [{ price: input.price ? String(input.price) : '0.00' }]

  const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ product: body }),
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.errors ? JSON.stringify(data.errors) : `Shopify product create failed (${res.status})`
    throw new Error(msg)
  }
  return data.product
}
