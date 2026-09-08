export function etsyUserMessage(error: unknown): { message: string; status: number } {
  const detail = error instanceof Error ? error.message : ''
  const match = detail.match(/\((\d{3})\)/)
  const status = match ? Number(match[1]) : 500
  if (status === 401) return { status, message: 'Etsy authorization expired. Please reconnect your Etsy shop.' }
  if (status === 403) return { status, message: 'Etsy did not allow this action. Check your shop permissions and listing details.' }
  if (status === 429) return { status, message: 'Etsy is temporarily rate limiting requests. Please try again shortly.' }
  if (status >= 500) return { status: 502, message: 'Etsy is temporarily unavailable. Please try again.' }
  return { status, message: detail || 'Unable to complete the Etsy request.' }
}
