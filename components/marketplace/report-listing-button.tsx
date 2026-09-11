'use client'

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'

const REASONS = [
  ['misleading', 'Misleading information'],
  ['prohibited', 'Prohibited item'],
  ['counterfeit', 'Counterfeit concern'],
  ['unsafe', 'Safety concern'],
  ['spam', 'Spam or abuse'],
  ['other', 'Other'],
] as const

export default function ReportListingButton({ storefrontId, productId }: { storefrontId: string; productId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('misleading')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/marketplace/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storefront_id: storefrontId, product_id: productId, reason, details }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(res.status === 401 ? 'Sign in to submit a report.' : data.error || 'Unable to submit report.')
        return
      }
      setMessage('Report submitted for review.')
      setDetails('')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"><Flag className="mr-1.5 h-3.5 w-3.5" />Report listing</button>

  return (
    <div className="mt-4 space-y-3 rounded-xl border bg-background p-4">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">Report this listing</p><button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground">Close</button></div>
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
        {REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <textarea value={details} onChange={(e) => setDetails(e.target.value.slice(0, 1000))} placeholder="Optional details" className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm outline-none" />
      <button type="button" onClick={submit} disabled={loading} className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit report</button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      <p className="text-[11px] leading-5 text-muted-foreground">Reports are reviewed; submitting one does not automatically remove a listing or prove wrongdoing.</p>
    </div>
  )
}
