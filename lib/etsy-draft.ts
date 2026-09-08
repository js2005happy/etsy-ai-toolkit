const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'

function etsyHeaders(accessToken: string): Record<string, string> {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey) throw new Error('Etsy API key is not configured.')
  return {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey,
    'Content-Type': 'application/json',
  }
}

export interface EtsyDraftReviewInput {
  title: string
  description: string
  tags: string[]
}

/**
 * Persist user-reviewed content to the existing Etsy draft before activation.
 * This intentionally updates content only; category, price, quantity, shipping,
 * and images remain the explicitly reviewed values already stored on the draft.
 */
export async function updateEtsyDraftReview(
  shopId: number,
  listingId: number,
  accessToken: string,
  input: EtsyDraftReviewInput
): Promise<Record<string, unknown>> {
  const response = await fetch(`${ETSY_API_BASE}/shops/${shopId}/listings/${listingId}`, {
    method: 'PATCH',
    headers: etsyHeaders(accessToken),
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      tags: input.tags.slice(0, 13),
    }),
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    console.error('Etsy draft review sync failed', {
      listingId,
      status: response.status,
      response: data,
    })
    throw new Error(`Etsy draft review sync failed (${response.status})`)
  }
  return data
}
