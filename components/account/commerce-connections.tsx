'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Plug, RefreshCw, Save, Store, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EBAY_REQUIRED_SCOPES = ['sell.inventory', 'sell.account', 'sell.fulfillment']

export default function CommerceConnections() {
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWoo, setConnectingWoo] = useState(false)
  const [savingEbay, setSavingEbay] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [woo, setWoo] = useState({ store_url: '', consumer_key: '', consumer_secret: '', label: '' })
  const [ebay, setEbay] = useState({ marketplace_id: 'EBAY_US', merchant_location_key: '', fulfillment_policy_id: '', payment_policy_id: '', return_policy_id: '', category_id: '' })
  const ebayConnection = useMemo(() => connections.find((connection) => connection.platform === 'ebay'), [connections])
  const ebayMissingScopes = useMemo(() => {
    if (!ebayConnection) return []
    const granted = new Set(Array.isArray(ebayConnection.scopes) ? ebayConnection.scopes : [])
    return EBAY_REQUIRED_SCOPES.filter((scope) => !granted.has(scope))
  }, [ebayConnection])

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

  useEffect(() => { void load() }, [])

  const connectWoo = async (e: React.FormEvent) => {
    e.preventDefault(); setConnectingWoo(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/woocommerce/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(woo) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to connect WooCommerce')
      setWoo({ store_url: '', consumer_key: '', consumer_secret: '', label: '' })
      setSuccess('WooCommerce connection verified and saved.')
      await load()
    } catch (err: any) { setError(err.message || 'Unable to connect WooCommerce') }
    finally { setConnectingWoo(false) }
  }

  const saveEbay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ebayConnection) return
    setSavingEbay(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/ebay/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connection_id: ebayConnection.id, ...ebay }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to save eBay settings')
      setSuccess('eBay publishing settings saved.')
      await load()
    } catch (err: any) { setError(err.message || 'Unable to save eBay settings') }
    finally { setSavingEbay(false) }
  }

  const disconnect = async (id: string) => {
    setError(''); setSuccess('')
    const res = await fetch('/api/commerce/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Unable to disconnect'); return }
    setConnections((current) => current.filter((connection) => connection.id !== id))
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5 text-primary" />More sales channels</CardTitle><CardDescription>Connect stores here. Craftly stores WooCommerce/eBay credentials encrypted server-side; passwords and tokens are never returned to the browser.</CardDescription></CardHeader>
        <CardContent className="space-y-8">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

          <div>
            <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-medium">Connected channels</h3><p className="text-sm text-muted-foreground">WooCommerce and eBay connections managed by the multichannel layer.</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>{loading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}Refresh</Button></div>
            {connections.length === 0 ? <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No additional commerce channels connected yet.</div> : <div className="space-y-2">{connections.map((connection) => <div key={connection.id} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium capitalize">{connection.platform}</p><p className="text-xs text-muted-foreground">{connection.account_label || connection.store_url || connection.account_key} · {connection.status}</p></div><Button size="sm" variant="ghost" onClick={() => disconnect(connection.id)}><Unplug className="mr-1 h-3.5 w-3.5" />Disconnect</Button></div>{connection.last_error && <p className="mt-2 text-xs text-destructive">{connection.last_error}</p>}</div>)}</div>}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70"><CardHeader><CardTitle className="text-base">WooCommerce</CardTitle><CardDescription>Use REST API read/write keys from your own WooCommerce store. Connection is verified before it is saved.</CardDescription></CardHeader><CardContent><form onSubmit={connectWoo} className="space-y-3"><div className="space-y-1.5"><Label>Store URL</Label><Input placeholder="https://shop.example.com" value={woo.store_url} onChange={(e) => setWoo({ ...woo, store_url: e.target.value })} required /></div><div className="space-y-1.5"><Label>Label (optional)</Label><Input placeholder="My main store" value={woo.label} onChange={(e) => setWoo({ ...woo, label: e.target.value })} /></div><div className="space-y-1.5"><Label>Consumer key</Label><Input type="password" autoComplete="off" placeholder="ck_…" value={woo.consumer_key} onChange={(e) => setWoo({ ...woo, consumer_key: e.target.value })} required /></div><div className="space-y-1.5"><Label>Consumer secret</Label><Input type="password" autoComplete="off" placeholder="cs_…" value={woo.consumer_secret} onChange={(e) => setWoo({ ...woo, consumer_secret: e.target.value })} required /></div><Button className="w-full" disabled={connectingWoo}>{connectingWoo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}Connect WooCommerce</Button></form></CardContent></Card>

            <Card className="border-border/70"><CardHeader><CardTitle className="text-base">eBay</CardTitle><CardDescription>Connect through eBay OAuth, then provide the selling policies eBay requires before an offer can be published.</CardDescription></CardHeader><CardContent className="space-y-4">{!ebayConnection ? <><p className="text-sm text-muted-foreground">OAuth gives Craftly seller inventory, account and fulfillment access without sharing your eBay password.</p><Button className="w-full" asChild><a href="/api/ebay/connect">Connect eBay</a></Button></> : <><div className="rounded-lg bg-muted px-3 py-2 text-sm">Connected as <strong>{ebayConnection.account_label || 'eBay seller'}</strong></div>{ebayMissingScopes.length > 0 && <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"><div className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>This eBay connection predates order import. Reconnect once to grant: {ebayMissingScopes.join(', ')}.</p></div><Button variant="outline" className="w-full" asChild><a href="/api/ebay/connect"><RefreshCw className="mr-2 h-4 w-4" />Reconnect eBay</a></Button></div>}<form onSubmit={saveEbay} className="space-y-3"><div className="space-y-1.5"><Label>Marketplace</Label><Input value={ebay.marketplace_id} onChange={(e) => setEbay({ ...ebay, marketplace_id: e.target.value.toUpperCase() })} placeholder="EBAY_US" required /></div><div className="space-y-1.5"><Label>Merchant location key</Label><Input value={ebay.merchant_location_key} onChange={(e) => setEbay({ ...ebay, merchant_location_key: e.target.value })} required /></div><div className="space-y-1.5"><Label>Fulfillment policy ID</Label><Input value={ebay.fulfillment_policy_id} onChange={(e) => setEbay({ ...ebay, fulfillment_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>Payment policy ID</Label><Input value={ebay.payment_policy_id} onChange={(e) => setEbay({ ...ebay, payment_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>Return policy ID</Label><Input value={ebay.return_policy_id} onChange={(e) => setEbay({ ...ebay, return_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>Default category ID (optional)</Label><Input value={ebay.category_id} onChange={(e) => setEbay({ ...ebay, category_id: e.target.value })} /></div><Button className="w-full" disabled={savingEbay}>{savingEbay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save eBay publishing settings</Button></form></>}</CardContent></Card>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
