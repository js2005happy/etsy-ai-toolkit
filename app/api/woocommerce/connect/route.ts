import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { encryptCommerceSecret } from '@/lib/commerce/secret-box'
import { normalizeWooStoreUrl, verifyWooCommerceConnection } from '@/lib/woocommerce'

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const storeUrl = normalizeWooStoreUrl(String(body.store_url || ''))
  const consumerKey = String(body.consumer_key || '').trim()
  const consumerSecret = String(body.consumer_secret || '').trim()
  const label = String(body.label || '').trim().slice(0, 120) || new URL(storeUrl).hostname
  if (!consumerKey || !consumerSecret) return NextResponse.json({ error: 'Consumer key and secret are required.' }, { status: 400 })

  try {
    await verifyWooCommerceConnection(storeUrl, { consumerKey, consumerSecret })
    const service = createServiceClient()
    const encrypted = encryptCommerceSecret({ consumerKey, consumerSecret })
    const { data, error } = await service.from('commerce_connections').upsert({
      user_id: auth.userId,
      platform: 'woocommerce',
      account_label: label,
      account_key: new URL(storeUrl).hostname,
      store_url: storeUrl,
      credentials_encrypted: encrypted,
      status: 'active',
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform,account_key' }).select('id,platform,account_label,account_key,store_url,status,created_at,updated_at').single()
    if (error) throw error
    return NextResponse.json({ connection: data })
  } catch (error: any) {
    console.error('WooCommerce connect failed', error)
    return NextResponse.json({ error: error.message || 'Unable to connect WooCommerce store.' }, { status: 400 })
  }
}
