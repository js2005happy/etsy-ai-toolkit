'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, Loader2, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PLATFORM_LABELS: Record<string, string> = {
  etsy: 'Etsy', shopify: 'Shopify', woocommerce: 'WooCommerce', amazon: 'Amazon', ebay: 'eBay', tiktok: 'TikTok Shop', walmart: 'Walmart', google: 'Google Shopping', craftly: 'Craftly',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [platform, setPlatform] = useState('all')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (platform !== 'all') params.set('platform', platform)
      const res = await fetch(`/api/commerce/orders?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to load orders')
      setOrders(data.orders || [])
      setSummary(data.summary || {})
    } catch (err: any) { setError(err.message || 'Unable to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [platform])

  const importWoo = async () => {
    setImporting(true); setError(''); setNotice('')
    try {
      const res = await fetch('/api/commerce/orders/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: 'woocommerce', days: 30 }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to import WooCommerce orders')
      setNotice(`Imported ${data.imported} WooCommerce orders and ${data.items} line items from the last ${data.window_days} days.`)
      await load()
    } catch (err: any) { setError(err.message || 'Unable to import WooCommerce orders') }
    finally { setImporting(false) }
  }

  const gross = useMemo(() => orders.reduce((total, order) => total + (Number(order.total) || 0), 0), [orders])
  const currencies = useMemo(() => Array.from(new Set(orders.map((o) => o.currency).filter(Boolean))), [orders])
  const grossLabel = currencies.length === 1 ? `${currencies[0]} ${gross.toFixed(2)}` : gross ? `${gross.toFixed(2)} mixed` : '—'

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">Commerce operations</p><h1 className="mt-1 font-display text-3xl font-bold">Order Inbox</h1><p className="mt-2 max-w-3xl text-muted-foreground">One operational view for marketplace orders. This workspace is read-first: imports never refund, fulfill, message buyers or move money.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={importWoo} disabled={importing || loading}>{importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Import WooCommerce</Button><Button variant="outline" onClick={load} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></div>
      </div>

      {notice && <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">{notice}</div>}
      {error && <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShoppingBag className="h-4 w-4" />Orders loaded</div><p className="mt-2 text-3xl font-semibold">{summary.total ?? orders.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><PackageCheck className="h-4 w-4" />Needs fulfillment</div><p className="mt-2 text-3xl font-semibold">{summary.needs_fulfillment ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Loaded order value</div><p className="mt-2 text-3xl font-semibold">{grossLabel}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div><CardTitle>Unified orders</CardTitle><CardDescription>Imported provider orders appear here with normalized status, totals and line items.</CardDescription></div>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All channels</option>
            {Object.entries(PLATFORM_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">No imported orders yet</p><p className="mt-1 text-sm text-muted-foreground">Connect WooCommerce and use the import button above. Other marketplace ingestion adapters will join this same normalized inbox.</p></div>
          ) : <div className="space-y-3">{orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex items-center gap-2"><span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{PLATFORM_LABELS[order.platform] || order.platform}</span><span className="font-medium">#{order.external_order_id}</span></div><p className="mt-2 text-sm text-muted-foreground">{order.buyer_name || order.buyer_email || 'Buyer details unavailable'} · {order.ship_to_country || 'Country unavailable'}</p></div>
                <div className="text-right"><p className="font-semibold">{order.currency || ''} {order.total == null ? '—' : Number(order.total).toFixed(2)}</p><p className="mt-1 text-xs text-muted-foreground">{order.financial_status || 'financial status unknown'} · {order.fulfillment_status || 'fulfillment status unknown'}</p></div>
              </div>
              {(order.commerce_order_items || []).length > 0 && <div className="mt-4 border-t pt-3 text-sm">{order.commerce_order_items.map((item: any) => <div key={item.id} className="flex justify-between gap-4 py-1"><span className="truncate">{item.quantity} × {item.title}{item.sku ? ` · ${item.sku}` : ''}</span><span className="shrink-0 text-muted-foreground">{item.total == null ? '' : Number(item.total).toFixed(2)}</span></div>)}</div>}
              {order.external_url && <a href={order.external_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm text-primary hover:underline">Open in marketplace <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>}
            </div>
          ))}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
