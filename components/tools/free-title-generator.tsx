'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Loader2, Sparkles, Tag } from 'lucide-react'

const DAILY_LIMIT = 3
const STORAGE_KEY = 'craftly_free_title_uses'
const EXAMPLE = 'Sterling silver moon necklace, handmade, minimalist, gift for her'

interface Result {
  title: string
  tags: string[]
  description_preview: string
  truncated: boolean
}

function usesToday(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { day, count } = JSON.parse(raw)
    if (day !== new Date().toISOString().slice(0, 10)) return 0
    return Number(count) || 0
  } catch {
    return 0
  }
}

function bumpUses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      day: new Date().toISOString().slice(0, 10),
      count: usesToday() + 1,
    }))
  } catch {
    // Server-side rate limiting remains authoritative.
  }
}

export default function FreeTitleGenerator() {
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [style, setStyle] = useState('')
  const [targetBuyer, setTargetBuyer] = useState('')
  const [occasion, setOccasion] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState<'title' | 'tags' | null>(null)
  const [used, setUsed] = useState(0)

  async function generate(event?: React.FormEvent) {
    event?.preventDefault()
    if (description.trim().length < 3) {
      setError('Describe your product in a few words.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tools/free-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          material: material || undefined,
          style: style || undefined,
          target_buyer: targetBuyer || undefined,
          occasion: occasion || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Generation failed. Please try again.')
        if (data.limitReached) {
          setLimitReached(true)
          setUsed(DAILY_LIMIT)
        }
        return
      }
      setResult(data)
      bumpUses()
      setUsed(usesToday())
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copy(text: string, type: 'title' | 'tags') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      // Manual selection remains available.
    }
  }

  const remaining = Math.max(0, DAILY_LIMIT - (used || usesToday()))

  return (
    <section className="px-5 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 grid gap-3 rounded-xl border border-border bg-card/70 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Before</p>
            <p className="mt-2 text-sm text-muted-foreground">silver moon necklace · 925 silver · gift · minimal</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Craftly example</p>
            <p className="mt-2 text-sm font-medium text-foreground">Handmade Sterling Silver Moon Pendant Necklace — Minimal Celestial Jewelry Gift</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 md:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">No signup · {limitReached ? 0 : remaining} free today</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Free to try
            </span>
          </div>

          <form onSubmit={generate} className="space-y-5">
            <div>
              <label htmlFor="free-product-description" className="mb-2 block text-sm font-medium text-foreground">Describe your product in a few words</label>
              <textarea
                id="free-product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Handmade ceramic mug, sage green, speckled glaze, 12 oz"
                maxLength={500}
                rows={4}
                className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={() => setDescription(EXAMPLE)} className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline">Try an example →</button>
            </div>

            {result && (
              <div>
                <button type="button" onClick={() => setShowAdvanced((value) => !value)} className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                  {showAdvanced ? 'Hide advanced inputs' : 'Want better results? Add optional details'}
                </button>
                {showAdvanced && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[
                      ['Material', material, setMaterial, 'Sterling silver'],
                      ['Style', style, setStyle, 'Minimalist'],
                      ['Target buyer', targetBuyer, setTargetBuyer, 'Gift shopper'],
                      ['Occasion', occasion, setOccasion, 'Birthday'],
                    ].map(([label, value, setter, placeholder]) => (
                      <label key={label as string} className="text-sm font-medium text-foreground">
                        {label as string}
                        <input value={value as string} onChange={(e) => (setter as (value: string) => void)(e.target.value)} placeholder={placeholder as string} maxLength={100} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading || limitReached} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Generating…' : result && showAdvanced ? 'Improve result' : 'Generate Etsy Titles'}
            </button>
          </form>

          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

          {limitReached && !loading && (
            <div className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-5 text-center">
              <p className="font-medium text-foreground">You&apos;ve used today&apos;s free generations.</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a free Craftly account for the full seller workspace.</p>
              <Link href="/signup" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Start free — no card</Link>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6" aria-live="polite">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Etsy title</h3>
                  <button type="button" onClick={() => copy(result.title, 'title')} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    {copied === 'title' ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                  </button>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-foreground">{result.title}</div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">13 tags</h3>
                  <button type="button" onClick={() => copy(result.tags.join(', '), 'tags')} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    {copied === 'tags' ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy all</>}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm"><Tag className="h-3 w-3 text-primary" />{tag}</span>)}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description preview</h3>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-muted-foreground">{result.description_preview}</div>
              </div>

              <div className="rounded-xl border border-primary/50 bg-primary/5 p-6 text-center">
                <p className="font-medium text-foreground">Turn this into a complete seller workflow.</p>
                <p className="mt-1 text-sm text-muted-foreground">Save listings, optimize, connect Etsy or Shopify, and keep your work in one place.</p>
                <Link href="/signup" className="mt-4 inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Start free — no card</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
