'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, Boxes, Loader2, Plus, RefreshCw, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const CATEGORIES = [
  ['generic', 'General Product'],
  ['apparel', 'Apparel'],
  ['jewelry', 'Jewelry'],
  ['home-decor', 'Home Decor'],
  ['art-print', 'Art & Prints'],
  ['personalized-gift', 'Personalized Gifts'],
  ['digital-product', 'Digital Products'],
  ['beauty', 'Beauty & Personal Care'],
  ['food', 'Food & Consumables'],
  ['electronics', 'Electronics & Tech'],
  ['accessories', 'Accessories'],
  ['craft-supplies', 'Craft Supplies'],
] as const

type Product = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  product_type?: string | null
  sku?: string | null
  price?: number | null
  currency?: string | null
  inventory_quantity?: number | null
  status: 'draft' | 'ready' | 'archived'
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '',
    product_type: '',
    category: 'generic',
    sku: '',
    price: '',
    currency: 'USD',
    inventory_quantity: '',
    description: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to load products')
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message || 'Unable to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return products
    return products.filter((product) => [product.title, product.product_type, product.sku].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle)))
  }, [products, query])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price === '' ? null : Number(form.price),
          inventory_quantity: form.inventory_quantity === '' ? null : Number(form.inventory_quantity),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to create product')
      setProducts((current) => [data.product, ...current])
      setForm({ title: '', product_type: '', category: 'generic', sku: '', price: '', currency: 'USD', inventory_quantity: '', description: '' })
      setShowCreate(false)
    } catch (err: any) {
      setError(err.message || 'Unable to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Commerce Core</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Product Hub</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Store each product once as a canonical source of truth, then adapt it for Etsy, Shopify, WooCommerce, Amazon, eBay and other channels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
          <Button onClick={() => setShowCreate((value) => !value)}><Plus className="mr-2 h-4 w-4" />New product</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Boxes className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{products.length}</p><p className="text-sm text-muted-foreground">canonical products</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600"><Sparkles className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{products.filter((p) => p.status === 'ready').length}</p><p className="text-sm text-muted-foreground">ready to adapt</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 pt-6"><div className="rounded-xl bg-muted p-3"><Archive className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{products.filter((p) => p.status === 'archived').length}</p><p className="text-sm text-muted-foreground">archived</p></div></CardContent></Card>
      </div>

      {showCreate && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Create canonical product</CardTitle><CardDescription>Start with facts you know. Missing category facts can be added later before publishing.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={create} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Product title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Product type</Label><Input value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} placeholder="necklace, hoodie, printable planner..." /></div>
              <div className="space-y-2"><Label>Category</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div className="grid grid-cols-[1fr_90px] gap-2"><div className="space-y-2"><Label>Price</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div><div className="space-y-2"><Label>Currency</Label><Input maxLength={8} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div></div>
              <div className="space-y-2"><Label>Inventory</Label><Input type="number" min="0" step="1" value={form.inventory_quantity} onChange={(e) => setForm({ ...form, inventory_quantity: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Source description / notes</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button><Button disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save product</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-5 flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" /><Input className="border-0 p-0 shadow-none focus-visible:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, types or SKU…" />
      </div>

      {error && <p className="mb-5 text-sm text-destructive">{error}</p>}
      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : filtered.length === 0 ? <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">No products yet. Create one canonical product to start the multichannel workflow.</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <Card key={product.id} className="transition hover:border-primary/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-3"><div><CardTitle className="line-clamp-2 text-lg">{product.title}</CardTitle><CardDescription className="mt-1">{product.product_type || product.category || 'General product'}{product.sku ? ` · ${product.sku}` : ''}</CardDescription></div><span className={`rounded-full px-2 py-1 text-xs ${product.status === 'ready' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{product.status}</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Price</span><span>{product.price == null ? '—' : `${product.currency || 'USD'} ${Number(product.price).toFixed(2)}`}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Inventory</span><span>{product.inventory_quantity ?? '—'}</span></div>
                <div className="grid grid-cols-2 gap-2"><Button variant="outline" asChild><Link href={`/dashboard/products/${product.id}`}>Open product</Link></Button><Button asChild><Link href={`/dashboard/multichannel?product=${product.id}`}>Adapt channels</Link></Button></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
