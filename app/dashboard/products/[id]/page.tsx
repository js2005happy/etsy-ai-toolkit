'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Archive, Loader2, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProductReadinessPanel from '@/components/dashboard/product-readiness-panel'

const CATEGORIES = [
  ['generic','General Product'],['apparel','Apparel'],['jewelry','Jewelry'],['home-decor','Home Decor'],['art-print','Art & Prints'],
  ['personalized-gift','Personalized Gifts'],['digital-product','Digital Products'],['beauty','Beauty & Personal Care'],['food','Food & Consumables'],
  ['electronics','Electronics & Tech'],['accessories','Accessories'],['craft-supplies','Craft Supplies'],
] as const

function factsToText(facts: Record<string, unknown> | null | undefined) {
  if (!facts) return ''
  return Object.entries(facts).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`).join('\n')
}

function parseFacts(text: string): Record<string, string> {
  return Object.fromEntries(text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const i = line.indexOf(':')
    return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : ['', '']
  }).filter(([key, value]) => key && value))
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [product, setProduct] = useState<any>(null)
  const [factsText, setFactsText] = useState('')
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const canonical = useMemo(() => product ? ({
    title: product.title,
    description: product.description || '',
    category: product.category || 'generic',
    productType: product.product_type || '',
    brand: product.brand || '',
    material: product.material || '',
    style: product.style || '',
    sku: product.sku || '',
    price: product.price == null ? undefined : Number(product.price),
    currency: product.currency || 'USD',
    inventoryQuantity: product.inventory_quantity == null ? undefined : Number(product.inventory_quantity),
    tags: product.tags || [],
    images: product.images || [],
    facts: parseFacts(factsText),
    shipping: product.shipping || {},
    compliance: product.compliance || {},
  }) : null, [product, factsText])

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/products/${id}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to load product')
      setProduct(data.product)
      setFactsText(factsToText(data.product.facts))
    } catch (err: any) { setError(err.message || 'Unable to load product') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (id) load() }, [id])

  useEffect(() => {
    if (!canonical?.title) return
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/product-readiness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: canonical }) })
        if (res.ok) setReadiness(await res.json())
      } catch {}
    }, 250)
    return () => clearTimeout(timer)
  }, [canonical])

  const save = async () => {
    if (!product) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, facts: parseFacts(factsText) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to save product')
      setProduct({ ...product, ...data.product })
      setSaved(true); setTimeout(() => setSaved(false), 1800)
    } catch (err: any) { setError(err.message || 'Unable to save product') }
    finally { setSaving(false) }
  }

  const archive = async () => {
    if (!product) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to archive product')
      setProduct({ ...product, status: 'archived' })
    } catch (err: any) { setError(err.message || 'Unable to archive product') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-9 w-9 animate-spin text-primary" /></div>
  if (!product) return <div className="container mx-auto max-w-4xl px-4 py-10"><Button variant="ghost" asChild><Link href="/dashboard/products"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button><p className="mt-8 text-destructive">{error || 'Product not found'}</p></div>

  const update = (key: string, value: unknown) => setProduct((current: any) => ({ ...current, [key]: value }))
  const channelListings = product.platform_listings || []

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild><Link href="/dashboard/products"><ArrowLeft className="mr-2 h-4 w-4" />Product Hub</Link></Button>
        <div className="flex gap-2"><Button variant="outline" onClick={archive} disabled={saving || product.status === 'archived'}><Archive className="mr-2 h-4 w-4" />Archive</Button><Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Saved' : 'Save product'}</Button></div>
      </div>

      {error && <p className="mb-5 text-sm text-destructive">{error}</p>}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Canonical product facts</CardTitle><CardDescription>Edit facts once. Channel drafts should adapt from this source instead of drifting apart.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={product.title || ''} onChange={(e) => update('title', e.target.value)} /></div>
            <div className="space-y-2"><Label>Product type</Label><Input value={product.product_type || ''} onChange={(e) => update('product_type', e.target.value)} /></div>
            <div className="space-y-2"><Label>Category</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={product.category || 'generic'} onChange={(e) => update('category', e.target.value)}>{CATEGORIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div className="space-y-2"><Label>Brand</Label><Input value={product.brand || ''} onChange={(e) => update('brand', e.target.value)} /></div>
            <div className="space-y-2"><Label>SKU</Label><Input value={product.sku || ''} onChange={(e) => update('sku', e.target.value)} /></div>
            <div className="space-y-2"><Label>Material</Label><Input value={product.material || ''} onChange={(e) => update('material', e.target.value)} /></div>
            <div className="space-y-2"><Label>Style</Label><Input value={product.style || ''} onChange={(e) => update('style', e.target.value)} /></div>
            <div className="grid grid-cols-[1fr_90px] gap-2"><div className="space-y-2"><Label>Price</Label><Input type="number" min="0" step="0.01" value={product.price ?? ''} onChange={(e) => update('price', e.target.value === '' ? null : Number(e.target.value))} /></div><div className="space-y-2"><Label>Currency</Label><Input value={product.currency || 'USD'} onChange={(e) => update('currency', e.target.value.toUpperCase())} /></div></div>
            <div className="space-y-2"><Label>Inventory</Label><Input type="number" min="0" step="1" value={product.inventory_quantity ?? ''} onChange={(e) => update('inventory_quantity', e.target.value === '' ? null : Number(e.target.value))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Source description / notes</Label><Textarea rows={7} value={product.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Verified facts</Label><Textarea rows={9} value={factsText} onChange={(e) => setFactsText(e.target.value)} placeholder="dimensions: 18 x 12 cm" /><p className="text-xs text-muted-foreground">One key: value fact per line. Only enter facts you can verify.</p></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Channel drafts</CardTitle><CardDescription>Local drafts created from this canonical product. Publishing remains a separate reviewed action.</CardDescription></CardHeader><CardContent>
            {channelListings.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No channel drafts yet.</div> : <div className="space-y-3">{channelListings.map((listing: any) => <div key={listing.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium capitalize">{listing.platform}</p><p className="text-xs text-muted-foreground">{listing.sync_status} · {listing.status}</p></div><span className="max-w-[55%] truncate text-sm text-muted-foreground">{listing.title}</span></div>)}</div>}
          </CardContent></Card>
        </div>

        <div className="space-y-5">
          {readiness && <ProductReadinessPanel data={{ product_profile: readiness.profile?.label, readiness_score: readiness.score, missing_critical_facts: readiness.missingCriticalFacts, readiness_issues: readiness.issues }} />}
          <Card><CardHeader><CardTitle className="text-base">Multichannel next step</CardTitle><CardDescription>Turn this one source product into platform-specific drafts.</CardDescription></CardHeader><CardContent><Button className="w-full" asChild><Link href={`/dashboard/multichannel?product=${id}`}><Sparkles className="mr-2 h-4 w-4" />Adapt channels</Link></Button></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
