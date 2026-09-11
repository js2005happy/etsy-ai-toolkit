'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plug, Store, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CommerceConnections() {
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWoo, setConnectingWoo] = useState(false)
  const [error, setError] = useState('')
  const [woo, setWoo] = useState({ store_url: '', consumer_key: '', consumer_secret: '', label: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/connections', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to load connections')
      setConnections(data.connections || [])
    } catch (err: any) { setError(err.message || 'Unable to load connections') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const connectWoo = async (e: React.FormEvent) => {
    e.preventDefault(); setConnectingWoo(true); setError('')
    try {
      const res = await fetch('/api/woocommerce/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(woo) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to connect WooCommerce')
      setWoo({ store_url: '', consumer_key: '', consumer_secret: '', label: '' })
      await load()
    } catch (err: any) { setError(err.message || 'Unable to connect WooCommerce') }
    finally { setConnectingWoo(false) }
  }

  const disconnect = async (id: string) => {
    setError('')
    const res = await fetch('/api/commerce/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Unable to disconnect'); return }
    setConnections((current) => current.filter((connection) => connection.id !== id))
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5 text-primary" />More sales channels</CardTitle>
          <CardDescription>Connect stores here. Craftly stores new WooCommerce/eBay credentials encrypted server-side; passwords and tokens are never returned to the browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-medium">Connected channels</h3><p className="text-sm text-muted-foreground">WooCommerce and eBay connections managed by the multichannel layer.</p></div><Button variant="outline" size="sm" onClick={load} disabled={loading}>{loading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}Refresh</Button></div>
            {connections.length === 0 ? <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No additional commerce channels connected yet.</div> : <div className="space-y-2">{connections.map((connection) => <div key={connection.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium capitalize">{connection.platform}</p><p className="text-xs text-muted-foreground">{connection.account_label || connection.store_url || connection.account_key} · {connection.status}</p></div><Button size="sm" variant="ghost" onClick={() => disconnect(connection.id)}><Unplug className="mr-1 h-3.5 w-3.5" />Disconnect</Button></div>)}</div>}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70"><CardHeader><CardTitle className="text-base">WooCommerce</CardTitle><CardDescription>Use REST API read/write keys from your own WooCommerce store. Connection is verified before it is saved.</CardDescription></CardHeader><CardContent><form onSubmit={connectWoo} className="space-y-3"><div className="space-y-1.5"><Label>Store URL</Label><Input placeholder="https://shop.example.com" value={woo.store_url} onChange={(e) => setWoo({ ...woo, store_url: e.target.value })} required /></div><div className="space-y-1.5"><Label>Label (optional)</Label><Input placeholder="My main store" value={woo.label} onChange={(e) => setWoo({ ...woo, label: e.target.value })} /></div><div className="space-y-1.5"><Label>Consumer key</Label><Input type="password" autoComplete="off" placeholder="ck_…" value={woo.consumer_key} onChange={(e) => setWoo({ ...woo, consumer_key: e.target.value })} required /></div><div className="space-y-1.5"><Label>Consumer secret</Label><Input type="password" autoComplete="off" placeholder="cs_…" value={woo.consumer_secret} onChange={(e) => setWoo({ ...woo, consumer_secret: e.target.value })} required /></div><Button className="w-full" disabled={connectingWoo}>{connectingWoo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}Connect WooCommerce</Button></form></CardContent></Card>

            <Card className="border-border/70"><CardHeader><CardTitle className="text-base">eBay</CardTitle><CardDescription>Connect through eBay OAuth. Craftly requests only the seller scopes needed for inventory and account policies.</CardDescription></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">After authorization, configure your marketplace, fulfillment, payment, return policy and merchant location before the first publish.</p><Button className="w-full" asChild><a href="/api/ebay/connect">Connect eBay</a></Button></CardContent></Card>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
