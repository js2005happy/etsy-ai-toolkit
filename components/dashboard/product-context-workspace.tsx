'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Languages, Mail, Megaphone, MessageCircle, Share2, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CinematicBackground from '@/components/cinematic/cinematic-background'

type Listing = {
  id: number
  title: string
  description: string
  tags: string[]
  state: string
  health: { score: number; issues: string[] }
}

function buildHref(path: string, params: Record<string, string>): string {
  const search = new URLSearchParams({ source: 'product-context', ...params })
  return `${path}?${search.toString()}`
}

export default function ProductContextWorkspace({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/etsy/listings/${listingId}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error ?? 'Could not load product context.')
        return data
      })
      .then((data) => {
        if (!cancelled) setListing(data.listing ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load product context.')
      })
    return () => {
      cancelled = true
    }
  }, [listingId])

  const context = useMemo(() => {
    if (!listing) return ''
    return [listing.description, listing.tags?.length ? `Tags: ${listing.tags.join(', ')}` : '']
      .filter(Boolean)
      .join('\n\n')
  }, [listing])

  if (error) return <div className="mx-auto max-w-4xl p-8 text-destructive">{error}</div>
  if (!listing) return <div className="mx-auto max-w-4xl p-8 text-muted-foreground">Loading product context…</div>

  const workflows = [
    {
      icon: Wand2,
      title: 'Review & optimize listing',
      description: 'Return to the Listing Workspace for health checks, change sets, version history and Etsy draft publishing.',
      href: `/dashboard/listings/${listing.id}`,
    },
    {
      icon: MessageCircle,
      title: 'Buyer reply',
      description: 'Preload this product as reply context so the response can stay specific to the item.',
      href: buildHref('/dashboard/messages', { product_info: `${listing.title} — ${listing.description}` }),
    },
    {
      icon: Share2,
      title: 'Social post',
      description: 'Carry the product description into Instagram, Pinterest or TikTok copy.',
      href: buildHref('/dashboard/social', { product_description: context }),
    },
    {
      icon: Megaphone,
      title: 'Ad copy',
      description: 'Use the same product facts as the starting brief for a paid campaign.',
      href: buildHref('/dashboard/ad-copy', { product_name: listing.title, product_description: context }),
    },
    {
      icon: Mail,
      title: 'Email campaign',
      description: 'Reuse this product context in a promotional, cart, welcome or win-back email.',
      href: buildHref('/dashboard/email', { product_name: listing.title, product_description: context }),
    },
    {
      icon: Languages,
      title: 'Translate listing copy',
      description: 'Start translation from the current title, description and tags instead of pasting them again.',
      href: buildHref('/dashboard/translate', { text: `${listing.title}\n\n${context}` }),
    },
  ]

  return (
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Link href="/dashboard/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Product Context</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">One product. More ways to sell it.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Move this Etsy listing through Craftly without retyping the same product facts in every tool.</p>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{listing.state}</p>
                  <CardTitle className="mt-1 font-display text-xl">{listing.title || 'Untitled listing'}</CardTitle>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Health {listing.health?.score ?? 0}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{listing.description || 'No description imported.'}</p>
              {listing.tags?.length > 0 && <p className="mt-4 text-xs text-muted-foreground">{listing.tags.slice(0, 6).join(' · ')}</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="flex gap-3 pt-6">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Product facts follow the workflow</p>
              <p className="mt-1 text-sm text-muted-foreground">Craftly passes the current listing context into the next tool. You can still edit every field before generating anything.</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.title} className="flex h-full flex-col">
              <CardContent className="flex h-full flex-col pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><workflow.icon className="h-5 w-5" /></div>
                <h2 className="mt-5 font-display text-xl">{workflow.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{workflow.description}</p>
                <Button asChild className="mt-6 w-full" variant="outline"><Link href={workflow.href}>Open with this product</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
