'use client'

import Link from 'next/link'
import { ExternalLink, Loader2, RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const DIRECT_PUBLISH = new Set(['shopify', 'woocommerce', 'ebay'])
const DIRECT_SYNC = new Set(['shopify', 'woocommerce', 'ebay'])

export default function ChannelDrafts({ listings, onPublished }: { listings: any[]; onPublished?: () => void | Promise<void> }) {
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [syncingKey, setSyncingKey] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const publish = async (listing: any) => {
    if (!DIRECT_PUBLISH.has(listing.platform) || listing.external_id) return
    const ok = window.confirm(`Publish this reviewed ${listing.platform} draft to your connected store? This creates a new external listing/product.`)
    if (!ok) return
    setPublishingId(listing.id); setMessage('')
    try {
      const res = await fetch(`/api/platform-listings/${listing.id}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setMessage(`${listing.platform} listing published successfully.`)
      await onPublished?.()
    } catch (error: any) {
      setMessage(error.message || 'Publish failed')
    } finally {
      setPublishingId(null)
    }
  }

  const sync = async (listing: any, syncType: 'inventory' | 'price') => {
    if (!DIRECT_SYNC.has(listing.platform) || !listing.external_id) return
    const value = syncType === 'inventory' ? listing.inventory_quantity : listing.price
    if (value == null) { setMessage(`Set a local ${syncType} value before syncing.`); return }
    const key = `${listing.id}:${syncType}`
    setSyncingKey(key); setMessage('')
    try {
      const payload = syncType === 'inventory'
        ? { platform_listing_id: listing.id, sync_type: syncType, inventory_quantity: Number(value) }
        : { platform_listing_id: listing.id, sync_type: syncType, price: Number(value), currency: listing.currency || 'USD' }
      const previewRes = await fetch('/api/commerce/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const previewData = await previewRes.json()
      if (!previewRes.ok) throw new Error(previewData.error || 'Unable to prepare sync')
      const previous = syncType === 'inventory'
        ? previewData.preview?.previous_value?.inventory_quantity
        : previewData.preview?.previous_value?.price
      const ok = window.confirm(`Sync ${syncType} to ${listing.platform}?\n\nCurrent recorded value: ${previous ?? 'unknown'}\nNew value: ${value}\n\nThis changes the connected external store.`)
      if (!ok) return
      const res = await fetch('/api/commerce/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, confirm: true }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      setMessage(`${listing.platform} ${syncType} synchronized successfully.`)
      await onPublished?.()
    } catch (error: any) {
      setMessage(error.message || 'Sync failed')
    } finally {
      setSyncingKey(null)
    }
  }

  if (!listings.length) return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No channel drafts yet.</div>

  return (
    <div className="space-y-3">
      {message && <p className="rounded-lg bg-muted px-3 py-2 text-sm">{message}</p>}
      {listings.map((listing) => {
        const supported = DIRECT_PUBLISH.has(listing.platform)
        const alreadyPublished = Boolean(listing.external_id)
        const syncSupported = DIRECT_SYNC.has(listing.platform) && alreadyPublished
        return (
          <div key={listing.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1"><p className="font-medium capitalize">{listing.platform}</p><p className="truncate text-sm text-muted-foreground">{listing.title}</p><p className="mt-1 text-xs text-muted-foreground">{listing.sync_status} · {listing.status}{listing.last_synced_at ? ` · synced ${new Date(listing.last_synced_at).toLocaleString()}` : ''}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                {listing.external_url && <Button size="sm" variant="outline" asChild><a href={listing.external_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Open</a></Button>}
                {syncSupported && <><Button size="sm" variant="outline" onClick={() => sync(listing, 'inventory')} disabled={syncingKey != null}>{syncingKey === `${listing.id}:inventory` ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}Sync stock</Button><Button size="sm" variant="outline" onClick={() => sync(listing, 'price')} disabled={syncingKey != null}>{syncingKey === `${listing.id}:price` ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}Sync price</Button></>}
                {supported ? alreadyPublished
                  ? <Button size="sm" variant="secondary" disabled>Published</Button>
                  : <Button size="sm" onClick={() => publish(listing)} disabled={publishingId === listing.id || listing.sync_status === 'pending'}>{publishingId === listing.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}Publish</Button>
                  : <Button size="sm" variant="secondary" disabled>Draft only</Button>}
              </div>
            </div>
            {listing.last_error && <p className="mt-2 text-xs text-destructive">{listing.last_error}</p>}
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground">Publishing and reviewed stock/price synchronization support Shopify, WooCommerce and eBay. Published items are never recreated by the UI; use the dedicated sync controls for supported external changes. Every sync requires preview + second confirmation. Existing Shopify/eBay connections may need reconnecting once for newer inventory/order scopes. Configure connections in <Link className="text-primary hover:underline" href="/account">Account</Link>.</p>
    </div>
  )
}
