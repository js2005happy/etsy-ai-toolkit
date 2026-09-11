'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, Save, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const EMPTY_STORE = { slug: '', name: '', headline: '', description: '', logo_url: '', banner_url: '', contact_email: '', currency: 'USD', is_published: false, seo_title: '', seo_description: '', shipping_policy: '', returns_policy: '', custom_order_policy: '', processing_time_text: '' }
const count = (value: unknown) => String(value || '').length

export default function StorefrontBuilderPage() {
  const [storefront, setStorefront] = useState<any>(EMPTY_STORE)
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
      if (storeRes.data.storefront) setStorefront({ ...EMPTY_STORE, ...storeRes.data.storefront })
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
      setStorefront({ ...EMPTY_STORE, ...settingsData.storefront })
      const productsRes = await fetch('/api/storefront/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_ids: selected }) })
      const productsData = await productsRes.json()
      if (!productsRes.ok) throw new Error(productsData.error || 'Unable to save storefront catalog')
      setMessage('Storefront settings saved.')
    } catch (err: any) { setError(err.message || 'Unable to save storefront') }
    finally { setSaving(false) }
  }

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" /><span className="sr-only">Loading storefront builder</span></div>
  const publicUrl = storefront.slug ? `/shop/${storefront.slug}` : null
  const hasPolicy = Boolean(storefront.processing_time_text || storefront.shipping_policy || storefront.returns_policy || storefront.custom_order_policy)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium text-primary">Craftly Storefront</p><h1 className="mt-1 font-display text-3xl font-bold">Build your seller catalog</h1><p className="mt-2 max-w-2xl text-muted-foreground">Publish a lightweight product catalog from your Product Hub. This phase intentionally does not process checkout or hold buyer funds.</p></div>{publicUrl && storefront.is_published && <Button variant="outline" asChild><Link target="_blank" rel="noreferrer" href={publicUrl}><ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />View storefront</Link></Button>}</div>
      {error && <p role="alert" className="mb-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Store identity</CardTitle><CardDescription>Your public catalog URL and seller-facing brand information.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="store-name">Store name</Label><Input id="store-name" value={storefront.name || ''} onChange={(e) => setStorefront({ ...storefront, name: e.target.value })} placeholder="Studio name" /></div>
            <div className="space-y-2"><Label htmlFor="store-slug">Store URL slug</Label><Input id="store-slug" value={storefront.slug || ''} onChange={(e) => setStorefront({ ...storefront, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="my-studio" /><p className="text-xs text-muted-foreground">craftly.world/shop/{storefront.slug || 'my-studio'}</p></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="store-headline">Headline</Label><Input id="store-headline" value={storefront.headline || ''} onChange={(e) => setStorefront({ ...storefront, headline: e.target.value })} placeholder="Small-batch pieces made for everyday rituals" /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="store-description">Description</Label><Textarea id="store-description" rows={6} value={storefront.description || ''} onChange={(e) => setStorefront({ ...storefront, description: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="store-logo">Logo URL</Label><Input id="store-logo" value={storefront.logo_url || ''} onChange={(e) => setStorefront({ ...storefront, logo_url: e.target.value })} placeholder="https://…" /></div>
            <div className="space-y-2"><Label htmlFor="store-banner">Banner URL</Label><Input id="store-banner" value={storefront.banner_url || ''} onChange={(e) => setStorefront({ ...storefront, banner_url: e.target.value })} placeholder="https://…" /></div>
            <div className="space-y-2"><Label htmlFor="store-email">Public contact email</Label><Input id="store-email" type="email" value={storefront.contact_email || ''} onChange={(e) => setStorefront({ ...storefront, contact_email: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="store-currency">Display currency</Label><Input id="store-currency" value={storefront.currency || 'USD'} maxLength={8} onChange={(e) => setStorefront({ ...storefront, currency: e.target.value.toUpperCase() })} /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Seller policies</CardTitle><CardDescription>Buyer-facing statements written by you. Craftly displays them for context and does not independently verify, guarantee, or enforce them.</CardDescription></CardHeader><CardContent className="space-y-5">
            <div className="space-y-2"><div className="flex justify-between gap-3"><Label htmlFor="processing-time">Processing time</Label><span className="text-xs text-muted-foreground">{count(storefront.processing_time_text)}/500</span></div><Input id="processing-time" maxLength={500} value={storefront.processing_time_text || ''} onChange={(e) => setStorefront({ ...storefront, processing_time_text: e.target.value })} placeholder="Usually ships within 3–5 business days" /></div>
            <div className="space-y-2"><div className="flex justify-between gap-3"><Label htmlFor="shipping-policy">Shipping policy</Label><span className="text-xs text-muted-foreground">{count(storefront.shipping_policy)}/2500</span></div><Textarea id="shipping-policy" maxLength={2500} rows={5} value={storefront.shipping_policy || ''} onChange={(e) => setStorefront({ ...storefront, shipping_policy: e.target.value })} placeholder="Where you ship, estimated transit times, tracking, customs…" /></div>
            <div className="space-y-2"><div className="flex justify-between gap-3"><Label htmlFor="returns-policy">Returns & exchanges</Label><span className="text-xs text-muted-foreground">{count(storefront.returns_policy)}/2500</span></div><Textarea id="returns-policy" maxLength={2500} rows={5} value={storefront.returns_policy || ''} onChange={(e) => setStorefront({ ...storefront, returns_policy: e.target.value })} placeholder="Return window, condition requirements, exclusions…" /></div>
            <div className="space-y-2"><div className="flex justify-between gap-3"><Label htmlFor="custom-policy">Custom orders</Label><span className="text-xs text-muted-foreground">{count(storefront.custom_order_policy)}/2500</span></div><Textarea id="custom-policy" maxLength={2500} rows={5} value={storefront.custom_order_policy || ''} onChange={(e) => setStorefront({ ...storefront, custom_order_policy: e.target.value })} placeholder="Whether custom orders are accepted and what buyers should expect…" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Catalog products</CardTitle><CardDescription>Only Product Hub items marked ready can appear publicly.</CardDescription></CardHeader><CardContent className="space-y-3">{readyProducts.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No ready products yet. Open Product Hub and mark complete products ready before adding them here.</div> : readyProducts.map((product) => <button type="button" aria-pressed={selected.includes(product.id)} onClick={() => toggle(product.id)} key={product.id} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected.includes(product.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}><div><p className="font-medium">{product.title}</p><p className="text-xs text-muted-foreground">{product.sku || product.product_type || product.category || 'Product'}</p></div><span className={`rounded-full px-2 py-1 text-xs ${selected.includes(product.id) ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{selected.includes(product.id) ? 'Included' : 'Hidden'}</span></button>)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Search preview</CardTitle><CardDescription>Basic SEO fields for the public storefront landing page.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="seo-title">SEO title</Label><Input id="seo-title" maxLength={70} value={storefront.seo_title || ''} onChange={(e) => setStorefront({ ...storefront, seo_title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="seo-description">SEO description</Label><Textarea id="seo-description" maxLength={170} rows={3} value={storefront.seo_description || ''} onChange={(e) => setStorefront({ ...storefront, seo_description: e.target.value })} /></div></CardContent></Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" aria-hidden="true" />Publication</CardTitle><CardDescription>Publishing exposes only the selected ready products in the public catalog.</CardDescription></CardHeader><CardContent className="space-y-4"><label className="flex items-start gap-3 rounded-xl border p-4"><input type="checkbox" className="mt-1" checked={Boolean(storefront.is_published)} onChange={(e) => setStorefront({ ...storefront, is_published: e.target.checked })} /><span><span className="block font-medium">Publish storefront</span><span className="mt-1 block text-xs text-muted-foreground">No checkout, payment collection, escrow, or automatic order creation is enabled.</span></span></label><Button onClick={save} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}Save storefront</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Buyer policy preview</CardTitle><CardDescription>Preview the seller-authored policy summary buyers will see.</CardDescription></CardHeader><CardContent className="space-y-4 text-sm">{!hasPolicy ? <p className="text-muted-foreground">No seller policies provided yet.</p> : <>{storefront.processing_time_text && <div><p className="font-medium">Processing time</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{storefront.processing_time_text}</p></div>}{storefront.shipping_policy && <div><p className="font-medium">Shipping</p><p className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted-foreground">{storefront.shipping_policy}</p></div>}{storefront.returns_policy && <div><p className="font-medium">Returns & exchanges</p><p className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted-foreground">{storefront.returns_policy}</p></div>}{storefront.custom_order_policy && <div><p className="font-medium">Custom orders</p><p className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted-foreground">{storefront.custom_order_policy}</p></div>}<p className="border-t pt-3 text-xs leading-5 text-muted-foreground">Seller-authored information only. Craftly does not independently verify or guarantee these statements.</p></>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Commerce foundation</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>{selected.length} products selected.</p><p>Catalog uses canonical Product Hub price and inventory.</p><p>Policies remain informational until a separate transaction system defines enforceable checkout terms.</p></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
