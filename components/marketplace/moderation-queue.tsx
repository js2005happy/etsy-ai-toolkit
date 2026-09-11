'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'

type Report = {
  id: string
  storefront_id: string
  product_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  resolution_note: string | null
  duplicate_count?: number
  storefront?: { id: string; slug: string; name: string } | null
  product?: { id: string; title: string; status: string } | null
}

export default function ModerationQueue() {
  const [reports, setReports] = useState<Report[]>([])
  const [status, setStatus] = useState('open')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`/api/marketplace/moderation/reports?status=${encodeURIComponent(status)}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setReports([])
        setMessage(res.status === 403 ? 'This account is not configured as a marketplace moderator.' : data.error || 'Unable to load moderation queue.')
        return
      }
      setReports(data.reports || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [status])

  const review = async (id: string, nextStatus: 'reviewing' | 'resolved' | 'dismissed') => {
    const note = nextStatus === 'reviewing' ? '' : window.prompt('Optional internal resolution note:') || ''
    const res = await fetch('/api/marketplace/moderation/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus, resolution_note: note }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data.error || 'Unable to update report.')
      return
    }
    setMessage(`Report marked ${nextStatus}.`)
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['open', 'reviewing', 'resolved', 'dismissed', 'all'].map((item) => (
            <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full border px-3 py-1.5 text-sm ${status === item ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}>{item}</button>
          ))}
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</button>
      </div>

      {message && <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{message}</div>}
      {loading ? <div className="flex min-h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading reports…</div> : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No reports in this queue.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const listingHref = report.storefront?.slug && report.product?.id ? `/shop/${report.storefront.slug}/products/${report.product.id}` : null
            const storeHref = report.storefront?.slug ? `/shop/${report.storefront.slug}` : null
            return (
              <article key={report.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /><p className="font-medium">{report.reason}</p>{(report.duplicate_count ?? 1) > 1 && <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{report.duplicate_count} reports on this product</span>}</div>
                    <p className="mt-2 font-medium">{report.product?.title || `Product ${report.product_id}`}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{report.storefront?.name || `Storefront ${report.storefront_id}`}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Report {report.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">{report.status}</span>
                </div>
                {(listingHref || storeHref) && <div className="mt-4 flex flex-wrap gap-3 text-sm">{listingHref && <Link href={listingHref} target="_blank" className="inline-flex items-center font-medium text-primary hover:underline">Open listing <ExternalLink className="ml-1 h-3.5 w-3.5" /></Link>}{storeHref && <Link href={storeHref} target="_blank" className="inline-flex items-center font-medium text-primary hover:underline">Open storefront <ExternalLink className="ml-1 h-3.5 w-3.5" /></Link>}</div>}
                {report.details && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm leading-6">{report.details}</p>}
                {report.resolution_note && <p className="mt-3 text-sm text-muted-foreground">Internal note: {report.resolution_note}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.status === 'open' && <button type="button" onClick={() => void review(report.id, 'reviewing')} className="rounded-lg border px-3 py-2 text-sm">Start review</button>}
                  {!['resolved', 'dismissed'].includes(report.status) && <button type="button" onClick={() => void review(report.id, 'resolved')} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Resolve</button>}
                  {!['resolved', 'dismissed'].includes(report.status) && <button type="button" onClick={() => void review(report.id, 'dismissed')} className="rounded-lg border px-3 py-2 text-sm">Dismiss</button>}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-muted-foreground">Changing report status records human review only. It does not automatically hide, delete, refund, penalize, or suspend any listing or seller.</p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
