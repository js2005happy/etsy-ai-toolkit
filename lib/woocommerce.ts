const REQUEST_TIMEOUT_MS = 15_000

export type WooCommerceCredentials = { consumerKey: string; consumerSecret: string }
export type WooProductInput = {
  name: string
  description?: string
  shortDescription?: string
  sku?: string
  regularPrice?: string
  stockQuantity?: number
  manageStock?: boolean
  categories?: Array<{ id?: number; name?: string }>
  tags?: Array<{ id?: number; name?: string }>
  images?: Array<{ src: string; alt?: string }>
  status?: 'draft' | 'publish' | 'pending' | 'private'
}

export function normalizeWooStoreUrl(input: string): string {
  const raw = input.trim()
  if (!raw) throw new Error('WooCommerce store URL is required')
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  if (url.protocol !== 'https:') throw new Error('WooCommerce store must use HTTPS')
  if (url.username || url.password) throw new Error('WooCommerce store URL must not include credentials')
  if (url.port && url.port !== '443') throw new Error('WooCommerce store URL must use the standard HTTPS port')
  if (['localhost','127.0.0.1','::1'].includes(url.hostname.toLowerCase())) throw new Error('Local WooCommerce hosts are not supported')
  url.pathname = ''; url.search = ''; url.hash = ''
  return url.toString().replace(/\/$/, '')
}

function authHeader(credentials: WooCommerceCredentials) {
  if (!credentials.consumerKey?.startsWith('ck_') || !credentials.consumerSecret?.startsWith('cs_')) throw new Error('Invalid WooCommerce REST API credentials')
  return `Basic ${Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString('base64')}`
}

async function wooFetch(storeUrl: string, credentials: WooCommerceCredentials, path: string, init: RequestInit = {}) {
  const base = normalizeWooStoreUrl(storeUrl)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', authHeader(credentials))
  try {
    return await fetch(`${base}/wp-json/wc/v3${path}`, { ...init, cache: 'no-store', signal: controller.signal, headers })
  } finally { clearTimeout(timeout) }
}

export async function verifyWooCommerceConnection(storeUrl: string, credentials: WooCommerceCredentials): Promise<{ storeUrl: string }> {
  const normalized = normalizeWooStoreUrl(storeUrl)
  const res = await wooFetch(normalized, credentials, '/system_status?context=view', { method: 'GET' })
  if (!res.ok) throw new Error(`WooCommerce connection verification failed (${res.status})`)
  return { storeUrl: normalized }
}

export async function createWooProduct(storeUrl: string, credentials: WooCommerceCredentials, input: WooProductInput): Promise<any> {
  if (!input.name?.trim()) throw new Error('WooCommerce product name is required')
  const payload: Record<string, unknown> = { name: input.name.trim().slice(0, 255), type: 'simple', status: input.status ?? 'draft' }
  if (input.description) payload.description = input.description
  if (input.shortDescription) payload.short_description = input.shortDescription
  if (input.sku) payload.sku = input.sku.slice(0, 100)
  if (input.regularPrice != null) payload.regular_price = String(input.regularPrice)
  if (Number.isInteger(input.stockQuantity) && Number(input.stockQuantity) >= 0) { payload.manage_stock = input.manageStock ?? true; payload.stock_quantity = Number(input.stockQuantity) }
  if (input.categories?.length) payload.categories = input.categories.slice(0, 20)
  if (input.tags?.length) payload.tags = input.tags.slice(0, 50)
  if (input.images?.length) payload.images = input.images.filter((image) => /^https:\/\//i.test(image.src)).slice(0, 20)
  const res = await wooFetch(storeUrl, credentials, '/products', { method: 'POST', body: JSON.stringify(payload) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || `WooCommerce product creation failed (${res.status})`)
  if (!data?.id) throw new Error('WooCommerce product creation returned no product id')
  return data
}

export async function updateWooProductStock(storeUrl: string, credentials: WooCommerceCredentials, productId: number, quantity: number): Promise<any> {
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Inventory quantity must be a non-negative integer')
  const res = await wooFetch(storeUrl, credentials, `/products/${encodeURIComponent(String(productId))}`, { method: 'PUT', body: JSON.stringify({ manage_stock: true, stock_quantity: quantity }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || `WooCommerce inventory update failed (${res.status})`)
  return data
}

export async function updateWooProductPrice(storeUrl: string, credentials: WooCommerceCredentials, productId: number, price: number): Promise<any> {
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a non-negative number')
  const res = await wooFetch(storeUrl, credentials, `/products/${encodeURIComponent(String(productId))}`, {
    method: 'PUT',
    body: JSON.stringify({ regular_price: price.toFixed(2) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || `WooCommerce price update failed (${res.status})`)
  return data
}

export async function listWooOrders(
  storeUrl: string,
  credentials: WooCommerceCredentials,
  options: { after?: string; perPage?: number } = {}
): Promise<any[]> {
  const params = new URLSearchParams({
    per_page: String(Math.min(Math.max(options.perPage ?? 50, 1), 100)),
    orderby: 'date',
    order: 'desc',
  })
  if (options.after) params.set('after', options.after)
  const res = await wooFetch(storeUrl, credentials, `/orders?${params.toString()}`, { method: 'GET' })
  const data = await res.json().catch(() => [])
  if (!res.ok) throw new Error(data?.message || `WooCommerce orders request failed (${res.status})`)
  if (!Array.isArray(data)) throw new Error('WooCommerce orders response was invalid')
  return data
}
