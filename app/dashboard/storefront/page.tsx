'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, Save, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function StorefrontBuilderPage() {
  const [storefront, setStorefront] = useState<any>({ slug: '', name: '', headline: '', description: '', logo_url: '', banner_url: '', contact_email: '', currency: 'USD', is_published: false, seo_title: '', seo_description: '' })
  const [products, setProducts] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const readyProducts = useMemo(() => products.filter((product) => product.status === 'ready'), [products])

  useEffect(() => {
    Promise.all([
      fetch('/api/storefront', { cache: 'no-store' }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
      fetch('/api/products?limit=100', { cache: 'no-store' }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
      fetch('/api/storefront/products', { cache: 'no-store' }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
    ]).then(([storeRes, productRes, selectionRes]) => {
      if (!storeRes.ok) throw new Error(storeRes.data.error || 'Unable to load storefront')
      if (!productRes.ok) throw new Error(productRes.data.error || 'Unable to load products')
      if (storeRes.data.storefront) setStorefront(storeRes.data.storefront)
      setProducts(productRes.data.products || [])
      if (selectionRes.ok) setSelected((selectionRes.data.selected || []).filter((row: any) => row.is_visible).map((row: any) => row.product_id))
    }).catch((err) => setError(err.message || 'Unable to load storefront')).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setError(''); setMessage('')
    try {
      const settingsRes = await fetch('/api/storefront', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(storefront) })
      const settingsData = await settingsRes.json()
      if (!settingsRes.ok) throw new Error(settingsData.error || 'Unable to save storefront')
      setStorefront(settingsData.storefront)

      const productsRes = await fetch('/api/storefront/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_ids: selected }) })
      const productsData = await productsRes.json()
      if (!productsRes.ok) throw new Error(productsData.error || 'Unable to save storefront catalog')
      setMessage('Storefront settings saved.')
    } catch (err: any) { setError(err.message || 'Unable to save storefront') }
    finally { setSaving(false) }
  }

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-primary" /></div>

  const publicUrl = storefront.slug ? `/shop/${storefront.slug}` : null

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-medium text-primary">Craftly Storefront</p><h1 className="mt-1 font-display text-3xl font-bold">Build your seller catalog</h1><p className="mt-2 max-w-2xl text-muted-foreground">Publish a lightweight product catalog from your Product Hub. This phase intentionally does not process checkout or hold buyer funds.</p></div>
        {publicUrl && storefront.is_published && <Button variant="outline" asChild><Link target="_blank" href={publicUrl}><ExternalLink className="mr-2 h-4 w-4" />View storefront</Link></Button>}
      </div>

      {error && <p className="mb-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {message && <p className="mb-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Store identity</CardTitle><CardDescription>Your public catalog URL and seller-facing brand information.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><Label>Store name</Label><Input value={storefront.name || ''} onChange={(e) => setStorefront({ ...storefront, name: e.target.value })} placeholder="Studio name" /></div>
            <div className="space-y-2"><Label>Store URL slug</Label><Input value={storefront.slug || ''} onChange={(e) => setStorefront({ ...storefront, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="my-studio" /><p className="text-xs text-muted-foreground">craftly.world/shop/{storefront.slug || 'my-studio'}</p></div>
            <div className="space-y-2 md:col-span-2"><Label>Headline</Label><Input value={storefront.headline || ''} onChange={(e) => setStorefront({ ...storefront, headline: e.target.value })} placeholder="Small-batch pieces made for everyday rituals" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={6} value={storefront.description || ''} onChange={(e) => setStorefront({ ...storefront, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Logo URL</Label><Input value={storefront.logo_url || ''} onChange={(e) => setStorefront({ ...storefront, logo_url: e.target.value })} placeholder="https://…" /></div>
            <div className="space-y-2"><Label>Banner URL</Label><Input value={storefront.banner_url || ''} onChange={(e) => setStorefront({ ...storefront, banner_url: e.target.value })} placeholder="https://…" /></div>
            <div className="space-y-2"><Label>Public contact email</Label><Input type="email" value={storefront.contact_email || ''} onChange={(e) => setStorefront({ ...storefront, contact_email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Display currency</Label><Input value={storefront.currency || 'USD'} maxLength={8} onChange={(e) => setStorefront({ ...storefront, currency: e.target.value.toUpperCase() })} /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Catalog products</CardTitle><CardDescription>Only Product Hub items marked ready can appear publicly.</CardDescription></CardHeader><CardContent className="space-y-3">
            {readyProducts.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No ready products yet. Open Product Hub and mark complete products ready before adding them here.</div> : readyProducts.map((product) => <button type="button" onClick={() => toggle(product.id)} key={product.id} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${selected.includes(product.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}><div><p className="font-medium">{product.title}</p><p className="text-xs text-muted-foreground">{product.sku || product.product_type || product.category || 'Product'}</p></div><span className={`rounded-full px-2 py-1 text-xs ${selected.includes(product.id) ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{selected.includes(product.id) ? 'Included' : 'Hidden'}</span></button>)}
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Search preview</CardTitle><CardDescription>Basic SEO fields for the public storefront landing page.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label>SEO title</Label><Input maxLength={70} value={storefront.seo_title || ''} onChange={(e) => setStorefront({ ...storefront, seo_title: e.target.value })} /></div><div className="space-y-2"><Label>SEO description</Label><Textarea maxLength={170} rows={3} value={storefront.seo_description || ''} onChange={(e) => setStorefront({ ...storefront, seo_description: e.target.value })} /></div></CardContent></Card>
        </div>

        <div className="space-y-5">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" />Publication</CardTitle><CardDescription>Publishing exposes only the selected ready products in the public catalog.</CardDescription></CardHeader><CardContent className="space-y-4"><label className="flex items-start gap-3 rounded-xl border p-4"><input type="checkbox" className="mt-1" checked={Boolean(storefront.is_published)} onChange={(e) => setStorefront({ ...storefront, is_published: e.target.checked })} /><span><span className="block font-medium">Publish storefront</span><span className="mt-1 block text-xs text-muted-foreground">No checkout, payment collection, escrow, or automatic order creation is enabled.</span></span></label><Button onClick={save} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save storefront</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Commerce foundation</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>{selected.length} products selected.</p><p>Catalog uses canonical Product Hub price and inventory.</p><p>Checkout will only be added after seller-payments, tax, refund and fraud responsibilities are designed separately from Craftly SaaS billing.</p></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
