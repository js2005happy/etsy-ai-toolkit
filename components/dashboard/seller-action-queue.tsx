'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, ListTodo, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SellerAction = {
  id: string
  kind: 'sync' | 'restore-sync' | 'publish' | 'draft' | 'health'
  priority: 'high' | 'medium' | 'low'
  title: string
  reason: string
  href: string
  healthScore?: number
}

type Summary = {
  totalListings: number
  drafts: number
  lowHealth: number
  needsAttention: number
}

const priorityLabel = {
  high: 'Do next',
  medium: 'Needs attention',
  low: 'Worth reviewing',
} as const

export default function SellerActionQueue() {
  const [actions, setActions] = useState<SellerAction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/seller/actions')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Unable to load seller actions.')
        return data
      })
      .then((data) => {
        if (cancelled) return
        setActions(Array.isArray(data.actions) ? data.actions : [])
        setSummary(data.summary ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load seller actions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur">
      <div className="border-b border-border px-6 py-6 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-4 w-4" /> AI Seller Workspace
            </div>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground">What needs attention today?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Craftly prioritizes work from your own shop data. No sales promises and no hidden Etsy ranking score — just explainable next actions.
            </p>
          </div>

          {summary && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryPill label="Listings" value={summary.totalListings} />
              <SummaryPill label="Drafts" value={summary.drafts} />
              <SummaryPill label="Low health" value={summary.lowHealth} />
              <SummaryPill label="Actions" value={summary.needsAttention} emphasize />
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> Building your action queue…
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Could not load your action queue.</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Nothing urgent is waiting.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you have not imported your Etsy listings yet, sync your shop to turn this dashboard into a real seller action queue.
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/shop">Open My Shop</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <article key={action.id} className="group rounded-2xl border border-border bg-background/50 p-5 transition-colors hover:border-primary/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{priorityLabel[action.priority]}</span>
                        {typeof action.healthScore === 'number' && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Health {action.healthScore}</span>
                        )}
                      </div>
                      <h3 className="mt-1 font-display text-lg text-foreground">{action.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{action.reason}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild className="shrink-0">
                    <Link href={action.href}>
                      Review <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ListTodo className="h-4 w-4" /> Priority comes from listing completeness, Craftly Health, review state and Etsy sync state.
        </div>
      </div>
    </section>
  )
}

function SummaryPill({ label, value, emphasize = false }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className={`min-w-20 rounded-xl border px-3 py-2 text-center ${emphasize ? 'border-primary/30 bg-primary/10' : 'border-border bg-background/50'}`}>
      <div className="font-display text-xl text-foreground">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
