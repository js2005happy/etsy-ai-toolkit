'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Boxes, Search } from 'lucide-react'

type Listing = { id: number; title: string; state: string; health: { score: number; issues: string[] }; images: unknown[] }

export default function ListingsPage() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ q: query, state })
    const response = await fetch(`/api/etsy/listings?${params}`)
    const result = await response.json().catch(() => ({}))
    setListings(result.listings ?? [])
    setLoading(false)
  }, [query, state])

  useEffect(() => {
    const timeout = setTimeout(load, 200)
    return () => clearTimeout(timeout)
  }, [load])

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow">My Shop</p>
      <h1 className="mt-2 font-display text-4xl">Listings</h1>
      <p className="mt-3 text-muted-foreground">Review Craftly Listing Health, decide what to improve, or carry one product into other workspace tools. It is not an official Etsy score.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listings…" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'draft'].map((filter) => (
            <Button key={filter} variant={state === filter ? 'default' : 'outline'} size="sm" onClick={() => setState(filter)}>
              {filter === 'all' ? 'All' : filter[0].toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          No imported listings yet. Go to <Link className="text-primary underline" href="/dashboard/shop">My Shop</Link> and sync Etsy.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <article className="rounded-2xl border bg-card p-5" key={listing.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{listing.state}</p>
                  <h2 className="mt-1 font-display text-xl">{listing.title || 'Untitled listing'}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Health {listing.health.score}</span>
              </div>
              {listing.health.issues.slice(0, 2).map((issue) => (
                <p className="mt-3 flex gap-2 text-sm text-amber-300" key={issue}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{issue}
                </p>
              ))}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" variant="outline" asChild><Link href={`/dashboard/listings/${listing.id}`}>Review & optimize</Link></Button>
                <Button className="flex-1" variant="outline" asChild><Link href={`/dashboard/product-context/${listing.id}`}><Boxes className="mr-2 h-4 w-4" />Use product context</Link></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
