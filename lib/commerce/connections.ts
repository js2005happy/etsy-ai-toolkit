import { createServiceClient } from '@/lib/supabase/service'
import { decryptCommerceSecret, encryptCommerceSecret } from '@/lib/commerce/secret-box'
import { refreshEbayToken } from '@/lib/ebay'
import type { WooCommerceCredentials } from '@/lib/woocommerce'

export async function resolveShopifyConnection(userId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('shopify_connections')
    .select('shop_domain,access_token,scopes')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return {
    shopDomain: data.shop_domain as string,
    accessToken: data.access_token as string,
    label: data.shop_domain as string,
    scopes: String(data.scopes || '').split(',').map((s) => s.trim()).filter(Boolean),
  }
}

export async function resolveWooCommerceConnection(userId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('commerce_connections')
    .select('id,account_label,store_url,credentials_encrypted,status')
    .eq('user_id', userId)
    .eq('platform', 'woocommerce')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  const credentials = decryptCommerceSecret<WooCommerceCredentials>(data.credentials_encrypted)
  return { storeUrl: data.store_url as string, credentials, label: data.account_label as string | undefined }
}

type StoredEbaySecret = {
  accessToken: string
  refreshToken?: string
  marketplaceId?: string
  merchantLocationKey?: string
  fulfillmentPolicyId?: string
  paymentPolicyId?: string
  returnPolicyId?: string
  categoryId?: string
}

export async function getEbayPublishingSettings(userId: string, connectionId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('commerce_connections')
    .select('credentials_encrypted')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .maybeSingle()
  if (!data) return null
  const secret = decryptCommerceSecret<StoredEbaySecret>(data.credentials_encrypted)
  return {
    marketplaceId: secret.marketplaceId || 'EBAY_US',
    merchantLocationKey: secret.merchantLocationKey || '',
    fulfillmentPolicyId: secret.fulfillmentPolicyId || '',
    paymentPolicyId: secret.paymentPolicyId || '',
    returnPolicyId: secret.returnPolicyId || '',
    categoryId: secret.categoryId || '',
  }
}

export async function resolveEbayConnection(userId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('commerce_connections')
    .select('id,account_label,credentials_encrypted,token_expires_at,status')
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .in('status', ['active','expired'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null

  let secret = decryptCommerceSecret<StoredEbaySecret>(data.credentials_encrypted)
  const expiresAt = data.token_expires_at ? new Date(data.token_expires_at).getTime() : 0
  if (expiresAt && expiresAt < Date.now() + 60_000) {
    if (!secret.refreshToken) return null
    try {
      const refreshed = await refreshEbayToken(secret.refreshToken)
      secret = { ...secret, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken || secret.refreshToken }
      await service.from('commerce_connections').update({
        credentials_encrypted: encryptCommerceSecret(secret),
        token_expires_at: new Date(Date.now() + Math.max(refreshed.expiresIn, 60) * 1000).toISOString(),
        status: 'active',
        last_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', data.id).eq('user_id', userId)
    } catch (error: any) {
      await service.from('commerce_connections').update({ status: 'error', last_error: error.message || 'eBay token refresh failed', updated_at: new Date().toISOString() }).eq('id', data.id).eq('user_id', userId)
      return null
    }
  }

  if (!secret.marketplaceId || !secret.merchantLocationKey || !secret.fulfillmentPolicyId || !secret.paymentPolicyId || !secret.returnPolicyId) {
    return null
  }

  return {
    accessToken: secret.accessToken,
    accountLabel: data.account_label as string | undefined,
    marketplaceId: secret.marketplaceId,
    merchantLocationKey: secret.merchantLocationKey,
    fulfillmentPolicyId: secret.fulfillmentPolicyId,
    paymentPolicyId: secret.paymentPolicyId,
    returnPolicyId: secret.returnPolicyId,
    categoryId: secret.categoryId,
  }
}

export async function updateEbayPublishingSettings(userId: string, connectionId: string, settings: Omit<StoredEbaySecret, 'accessToken' | 'refreshToken'>) {
  const service = createServiceClient()
  const { data } = await service
    .from('commerce_connections')
    .select('credentials_encrypted')
    .eq('id', connectionId)
    .eq('user_id', userId)
    .eq('platform', 'ebay')
    .maybeSingle()
  if (!data) throw new Error('eBay connection not found')
  const secret = decryptCommerceSecret<StoredEbaySecret>(data.credentials_encrypted)
  const merged: StoredEbaySecret = { ...secret, ...settings }
  const { error } = await service.from('commerce_connections').update({ credentials_encrypted: encryptCommerceSecret(merged), updated_at: new Date().toISOString(), status: 'active', last_error: null }).eq('id', connectionId).eq('user_id', userId)
  if (error) throw error
}
