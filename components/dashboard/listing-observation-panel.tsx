'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock3, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ListingObservation = {
  id: number
  connection_id: number
  etsy_listing_id: number
  state: string
  listing_url: string | null
  synced_at: string | null
  source_updated_at: string | null
  health: { score: number; issues: string[] }
}

function timeLabel(value: string | null) {
  if (!value) return 'Not available yet'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not available yet' : date.toLocaleString()
}

export default function ListingObservationPanel({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<ListingObservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (): Promise<ListingObservation | null> => {
    const response = await fetch(`/api/etsy/listings/${listingId}`, { cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error ?? 'Could not load the current Etsy listing state.')
    const next = (data.listing ?? null) as ListingObservation | null
    setListing(next)
    return next
  }, [listingId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const next = await load()
        if (cancelled) return
        setListing(next)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load listing observation data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const refreshFromEtsy = async () => {
    if (!listing) return
    const beforeScore = listing.health.score
    setRefreshing(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/etsy/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: listing.connection_id, kind: 'manual' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'Could not refresh shop data from Etsy.')

      const refreshed = await load()
      if (!refreshed) throw new Error('The listing was not returned after the Etsy refresh.')

      const afterScore = refreshed.health.score
      const scoreText =
        beforeScore === afterScore
          ? `Craftly Health remains ${afterScore}/100.`
          : `Craftly Health is now ${afterScore}/100 (previously ${beforeScore}/100).`

      setMessage(
        `Etsy data refreshed. ${scoreText} This is a completeness checklist only, not evidence of ranking, traffic, conversion or sales performance.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh this listing from Etsy.')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-5 pb-12 text-sm text-muted-foreground">Loading post-publish status…</div>
  }

  if (!listing) return null

  const isActive = listing.state === 'active'

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12">
      <div className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Post-publish observation</p>
            <h2 className="mt-1 font-display text-2xl">Refresh from Etsy. Re-evaluate. Decide the next action.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Craftly can verify the current Etsy copy and rerun its transparent completeness checks. It does not infer search rank, traffic, conversion or sales changes from this refresh.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.listing_url && (
              <Button asChild variant="outline">
                <a href={listing.listing_url} target="_blank" rel="noreferrer">
                  Open on Etsy <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            <Button onClick={refreshFromEtsy} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing from Etsy…' : 'Refresh from Etsy'}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Etsy state</p>
            <p className="mt-2 flex items-center gap-2 font-medium text-foreground">
              {isActive && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {listing.state || 'unknown'}
            </p>
          </div>
          <div className="rounded-xl border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Craftly Health</p>
            <p className="mt-2 flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> {listing.health.score}/100
            </p>
          </div>
          <div className="rounded-xl border bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Last synced</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="h-4 w-4 text-muted-foreground" /> {timeLabel(listing.synced_at)}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground">
            {isActive
              ? 'This listing is active on Etsy. Refresh whenever you want Craftly to re-read Etsy as the source of truth.'
              : 'Finish review and publishing above. After activation, use this panel to re-read Etsy and verify the current listing state.'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Etsy source updated: {timeLabel(listing.source_updated_at)}</p>
          {listing.health.issues.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">Next checklist issue: {listing.health.issues[0]}</p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No Craftly completeness issues are currently detected.</p>
          )}
        </div>

        <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-5">
          {['Review changes', 'Save Etsy draft', 'Explicit publish', 'Refresh from Etsy', 'Re-evaluate'].map((step, index) => (
            <div className="rounded-lg border px-3 py-2" key={step}>
              <span className="mr-2 font-semibold text-foreground">{index + 1}</span>{step}
            </div>
          ))}
        </div>

        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
      </div>
    </section>
  )
}
