'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Store, ListChecks } from 'lucide-react'

type Shop = { connected: boolean; connection?: { id: number; shop_name: string }; totals?: { total: number; active: number; drafts: number }; last_synced_at?: string | null }

export default function ShopPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const load = useCallback(() => fetch('/api/etsy/shop').then((res) => res.ok ? res.json() : null).then(setShop), [])
  useEffect(() => { load() }, [load])
  const sync = async () => {
    if (!shop?.connection) return
    setSyncing(true); setMessage(null)
    const response = await fetch('/api/etsy/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connection_id: shop.connection.id, kind: shop.totals?.total ? 'manual' : 'initial' }) })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? `${result.imported} listings synced${result.failed ? `; ${result.failed} failed` : ''}.` : result.error || 'Sync failed.')
    await load(); setSyncing(false)
  }
  if (!shop) return <div className="mx-auto max-w-5xl p-8 text-muted-foreground">Loading your shop…</div>
  if (!shop.connected) return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><Store className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-5 font-display text-4xl">Connect your Etsy shop</h1><p className="mx-auto mt-4 max-w-xl text-muted-foreground">Import listings, find opportunities, review improvements, and publish only the changes you approve.</p><Button className="mt-8" asChild><a href="/api/etsy/connect">Connect Etsy</a></Button></div>
  return <div className="mx-auto max-w-5xl px-5 py-12"><p className="eyebrow">My Shop</p><div className="mt-2 flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-4xl">{shop.connection?.shop_name}</h1><p className="mt-2 text-emerald-400">✓ Etsy connected</p></div><Button onClick={sync} disabled={syncing}>{syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Sync shop</Button></div>{message && <p className="mt-5 text-sm text-muted-foreground">{message}</p>}<div className="mt-10 grid gap-4 sm:grid-cols-3">{[['Listings', shop.totals?.total ?? 0], ['Active', shop.totals?.active ?? 0], ['Drafts', shop.totals?.drafts ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-card p-6"><p className="text-muted-foreground">{label}</p><p className="mt-2 font-display text-4xl">{value}</p></div>)}</div><div className="mt-8 rounded-2xl border bg-card p-6"><ListChecks className="h-5 w-5 text-primary" /><h2 className="mt-3 font-display text-2xl">Ready to review your listings?</h2><p className="mt-2 text-muted-foreground">Craftly Listing Health is our own completeness score — not an official Etsy score.</p><Button className="mt-5" variant="outline" asChild><Link href="/dashboard/listings">Open listings</Link></Button></div></div>
}
