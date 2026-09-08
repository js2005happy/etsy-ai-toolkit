'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Listing = {
  id: number
  connection_id: number
  etsy_listing_id: number
  title: string
  description: string
  tags: string[]
  images: unknown[]
  state: string
  taxonomy_id: number | null
  price: number | null
  quantity: number | null
  health: { score: number; breakdown: Record<string, number>; issues: string[] }
}
type Version = { id: number; source: string; created_at: string }
type Suggestion = { title: string; description: string; tags: string[]; suggestions?: string }
type ReviewFields = Record<'title' | 'description' | 'tags', boolean>

export default function ListingWorkspace({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [accepted, setAccepted] = useState<ReviewFields>({ title: false, description: false, tags: false })
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [listingData, history] = await Promise.all([
      fetch(`/api/etsy/listings/${listingId}`).then((res) => res.json()),
      fetch(`/api/etsy/listings/${listingId}/versions`).then((res) => res.json()),
    ])
    setListing(listingData.listing ?? null)
    setVersions(history.versions ?? [])
  }, [listingId])

  useEffect(() => {
    load()
  }, [load])

  const optimize = async () => {
    if (!listing) return
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/optimize-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_title: listing.title,
        current_description: listing.description,
        current_tags: listing.tags.join(', '),
        platform: 'etsy',
        listing_id: listing.id,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuggestion(data)
      setAccepted({ title: false, description: false, tags: false })
    } else {
      setMessage(data.error ?? 'Could not generate suggestions.')
    }
    setLoading(false)
    await load()
  }

  const save = async () => {
    if (!listing || !suggestion) return
    setLoading(true)
    if (!Object.values(accepted).some(Boolean)) {
      setMessage('Accept at least one suggested field before saving.')
      setLoading(false)
      return
    }
    const reviewed = {
      title: accepted.title ? suggestion.title : listing.title,
      description: accepted.description ? suggestion.description : listing.description,
      tags: accepted.tags ? suggestion.tags : listing.tags,
    }
    const res = await fetch(`/api/etsy/listings/${listing.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewed),
    })
    setMessage(res.ok ? 'Reviewed changes saved in Craftly. Nothing was published.' : 'Could not save changes.')
    if (res.ok) {
      setSuggestion(null)
      await load()
    }
    setLoading(false)
  }

  const restore = async (versionId: number) => {
    if (!listing || !window.confirm('Restore this version in Craftly? This will not publish to Etsy.')) return
    setLoading(true)
    const res = await fetch(`/api/etsy/listings/${listing.id}/versions/${versionId}/restore`, { method: 'POST' })
    setMessage(res.ok ? 'Version restored in Craftly.' : 'Could not restore version.')
    if (res.ok) await load()
    setLoading(false)
  }

  const publish = async () => {
    if (!listing || listing.state !== 'draft') return
    const confirmed = window.confirm(
      'Publish this Etsy draft now? Craftly will activate the current Etsy draft only after this confirmation. Make sure title, description, category, price, quantity, shipping and images are ready.'
    )
    if (!confirmed) return

    setPublishing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/etsy/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: String(listing.connection_id),
          listing_id: listing.etsy_listing_id,
          confirm_publish: true,
        }),
      })
      const data = await res.json()
      setMessage(res.ok ? 'Published to Etsy after your explicit confirmation.' : data.error ?? 'Could not publish this Etsy draft.')
      if (res.ok) await load()
    } catch {
      setMessage('Could not publish this Etsy draft. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  if (!listing) {
    return <div className="mx-auto max-w-6xl p-8 text-muted-foreground">Loading listing…</div>
  }

  const fieldButton = (field: keyof ReviewFields) => (
    <Button
      type="button"
      size="sm"
      variant={accepted[field] ? 'default' : 'outline'}
      onClick={() => setAccepted({ ...accepted, [field]: !accepted[field] })}
    >
      {accepted[field] ? '✓ Accepted' : 'Accept'}
    </Button>
  )

  const publishReady =
    listing.state === 'draft' &&
    !!listing.taxonomy_id &&
    Number(listing.price) > 0 &&
    Number(listing.quantity) > 0

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Listing Workspace</p>
          <h1 className="mt-2 font-display text-4xl">Review changes before publishing</h1>
          <p className="mt-3 text-muted-foreground">Craftly Listing Health: {listing.health.score}/100 — not an official Etsy score.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide">Etsy state: {listing.state}</span>
          {listing.state === 'draft' && (
            <Button type="button" onClick={publish} disabled={publishing || !publishReady}>
              {publishing ? 'Publishing…' : 'Publish reviewed draft to Etsy'}
            </Button>
          )}
          {listing.state === 'draft' && !publishReady && (
            <p className="max-w-sm text-right text-xs text-muted-foreground">Confirm category, price and quantity before publishing. Etsy also requires at least one uploaded image; the server verifies that at publish time.</p>
          )}
        </div>
      </div>

      {message && <p role="status" className="mt-4 rounded-xl border bg-card p-3 text-sm">{message}</p>}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-xl">Current Etsy listing</h2>
          <p className="mt-5 text-xs text-muted-foreground">TITLE</p>
          <p>{listing.title}</p>
          <p className="mt-5 text-xs text-muted-foreground">DESCRIPTION</p>
          <p className="whitespace-pre-wrap text-sm">{listing.description}</p>
          <p className="mt-5 text-xs text-muted-foreground">TAGS</p>
          <p className="text-sm">{listing.tags.join(', ') || 'No tags imported'}</p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-xl">AI suggestions</h2>
          <Button className="mt-5" onClick={optimize} disabled={loading}>Generate suggestions</Button>
          {suggestion && (
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">TITLE</p>{fieldButton('title')}</div>
                <Textarea value={suggestion.title} onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">DESCRIPTION</p>{fieldButton('description')}</div>
                <Textarea className="min-h-44" value={suggestion.description} onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">TAGS</p>{fieldButton('tags')}</div>
                <Textarea value={suggestion.tags.join(', ')} onChange={(e) => setSuggestion({ ...suggestion, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={loading}>Save accepted fields</Button>
                <Button variant="outline" onClick={() => setSuggestion(null)}>Reject all</Button>
              </div>
              <p className="text-xs text-muted-foreground">Unaccepted fields keep their current values. Nothing is published automatically.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-xl">Listing Health</h2>
          {Object.entries(listing.health.breakdown).map(([label, score]) => (
            <div className="mt-4" key={label}>
              <div className="flex justify-between text-sm"><span className="capitalize">{label}</span><span>{score}/20</span></div>
              <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score * 5}%` }} /></div>
            </div>
          ))}
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {listing.health.issues.map((issue) => <li key={issue}>{issue}</li>)}
          </ol>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-xl">Version History</h2>
        {versions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No saved versions yet.</p>
        ) : (
          <div className="mt-4 divide-y">
            {versions.map((version) => (
              <div className="flex items-center justify-between py-3" key={version.id}>
                <div>
                  <p className="capitalize">{version.source} snapshot</p>
                  <time className="text-xs text-muted-foreground">{new Date(version.created_at).toLocaleString()}</time>
                </div>
                <Button size="sm" variant="outline" onClick={() => restore(version.id)} disabled={loading}>Restore</Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
