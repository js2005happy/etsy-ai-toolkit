import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const etsy = Boolean(process.env.ETSY_API_KEY && process.env.ETSY_SHARED_SECRET && process.env.ETSY_REDIRECT_URI)
  const shopify = Boolean(process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET && process.env.SHOPIFY_REDIRECT_URI)
  const credentialEncryption = Boolean(process.env.COMMERCE_CREDENTIALS_KEY)
  const woocommerce = credentialEncryption
  const ebay = Boolean(
    credentialEncryption &&
    process.env.EBAY_CLIENT_ID &&
    process.env.EBAY_CLIENT_SECRET &&
    process.env.EBAY_REDIRECT_URI_NAME
  )

  const channels = { etsy, shopify, woocommerce, ebay }
  const ready = Object.values(channels).every(Boolean)

  return NextResponse.json(
    {
      ready,
      channels,
      first_batch: ['etsy', 'shopify', 'woocommerce', 'ebay'],
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
