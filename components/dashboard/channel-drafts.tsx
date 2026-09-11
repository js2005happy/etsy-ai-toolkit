'use client'

import Link from 'next/link'
import { ExternalLink, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const DIRECT_PUBLISH = new Set(['shopify', 'woocommerce', 'ebay'])

export default function ChannelDrafts({ listings, onPublished }: { listings: any[]; onPublished?: () => void | Promise<void> }) {
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const publish = async (listing: any) => {
    if (!DIRECT_PUBLISH.has(listing.platform)) return
    const ok = window.confirm(`Publish this reviewed ${listing.platform} draft to your connected store? This is an external action.`)
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

  if (!listings.length) return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No channel drafts yet.</div>

  return (
    <div className="space-y-3">
      {message && <p className="rounded-lg bg-muted px-3 py-2 text-sm">{message}</p>}
      {listings.map((listing) => {
        const supported = DIRECT_PUBLISH.has(listing.platform)
        return (
          <div key={listing.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1"><p className="font-medium capitalize">{listing.platform}</p><p className="truncate text-sm text-muted-foreground">{listing.title}</p><p className="mt-1 text-xs text-muted-foreground">{listing.sync_status} · {listing.status}{listing.last_synced_at ? ` · synced ${new Date(listing.last_synced_at).toLocaleString()}` : ''}</p></div>
              <div className="flex items-center gap-2">
                {listing.external_url && <Button size="sm" variant="outline" asChild><a href={listing.external_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Open</a></Button>}
                {supported ? <Button size="sm" onClick={() => publish(listing)} disabled={publishingId === listing.id || listing.sync_status === 'pending'}>{publishingId === listing.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}{listing.external_id ? 'Republish draft' : 'Publish'}</Button> : <Button size="sm" variant="secondary" disabled>Draft only</Button>}
              </div>
            </div>
            {listing.last_error && <p className="mt-2 text-xs text-destructive">{listing.last_error}</p>}
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground">Direct publishing currently supports Shopify, WooCommerce and eBay. Configure connections in <Link className="text-primary hover:underline" href="/account">Account</Link>. Other channels remain reviewed local drafts until their publishing connectors are enabled.</p>
    </div>
  )
}
