const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'

function headers(accessToken: string, contentType?: string): Record<string, string> {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey) throw new Error('Etsy API key is not configured.')
  return {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey,
    ...(contentType ? { 'Content-Type': contentType } : {}),
  }
}

export async function getListingImageCount(listingId: number, accessToken: string): Promise<number> {
  const response = await fetch(`${ETSY_API_BASE}/listings/${listingId}/images`, {
    headers: headers(accessToken),
  })
  if (!response.ok) {
    console.error('Etsy listing image verification failed', { listingId, status: response.status })
    throw new Error(`Etsy image verification failed (${response.status})`)
  }
  const data = await response.json().catch(() => ({}))
  if (Array.isArray(data?.results)) return data.results.length
  return Number.isFinite(Number(data?.count)) ? Number(data.count) : 0
}

/**
 * Explicit final activation step. This is deliberately separate from draft
 * creation so AI output can never become a live Etsy listing without a user
 * action after review.
 */
export async function activateListing(
  shopId: number,
  listingId: number,
  accessToken: string
): Promise<Record<string, unknown>> {
  const imageCount = await getListingImageCount(listingId, accessToken)
  if (imageCount < 1) {
    throw new Error('At least one Etsy listing image is required before publishing.')
  }

  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}`, {
    method: 'PATCH',
    headers: headers(accessToken, 'application/x-www-form-urlencoded'),
    body: new URLSearchParams({ state: 'active' }).toString(),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('Etsy listing activation failed', { listingId, status: response.status, response: data })
    throw new Error(`Etsy listing activation failed (${response.status})`)
  }
  return data as Record<string, unknown>
}
