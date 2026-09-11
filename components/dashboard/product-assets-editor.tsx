'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type ProductImageDraft = { url: string; alt?: string; role?: string }

function parseOptions(value: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of value.split(',')) {
    const [key, ...rest] = part.split('=')
    const val = rest.join('=').trim()
    if (key?.trim() && val) result[key.trim()] = val
  }
  return result
}

function optionsText(options: Record<string, unknown> | null | undefined) {
  return Object.entries(options || {}).map(([key, value]) => `${key}=${String(value)}`).join(', ')
}

export default function ProductAssetsEditor({
  productId,
  images,
  variants,
  currency,
  onImagesChange,
  onVariantsChange,
}: {
  productId: string
  images: ProductImageDraft[]
  variants: any[]
  currency: string
  onImagesChange: (images: ProductImageDraft[]) => void
  onVariantsChange: (variants: any[]) => void
}) {
  const [image, setImage] = useState<ProductImageDraft>({ url: '', alt: '', role: 'other' })
  const [variant, setVariant] = useState({ title: '', sku: '', options: '', price: '', inventory_quantity: '', image_url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canAddImage = useMemo(() => /^https:\/\//i.test(image.url.trim()) && images.length < 30, [image.url, images.length])

  const addImage = () => {
    if (!canAddImage) return
    onImagesChange([...images, { url: image.url.trim(), alt: image.alt?.trim() || undefined, role: image.role || 'other' }])
    setImage({ url: '', alt: '', role: 'other' })
  }

  const addVariant = async () => {
    if (!variant.title.trim()) return
    setSaving(true); setError('')
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: variant.title,
          sku: variant.sku || null,
          options: parseOptions(variant.options),
          price: variant.price === '' ? null : Number(variant.price),
          currency,
          inventory_quantity: variant.inventory_quantity === '' ? null : Number(variant.inventory_quantity),
          image_url: variant.image_url || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to create variant')
      onVariantsChange([...variants, data.variant])
      setVariant({ title: '', sku: '', options: '', price: '', inventory_quantity: '', image_url: '' })
    } catch (err: any) { setError(err.message || 'Unable to create variant') }
    finally { setSaving(false) }
  }

  const deleteVariant = async (id: string) => {
    setSaving(true); setError('')
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Unable to delete variant')
      onVariantsChange(variants.filter((item) => item.id !== id))
    } catch (err: any) { setError(err.message || 'Unable to delete variant') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Product images</CardTitle><CardDescription>Add verified source images once, then reuse them across marketplace drafts. HTTPS image URLs only.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{images.map((item, index) => <div key={`${item.url}-${index}`} className="flex items-center gap-3 rounded-lg border p-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted"><img src={item.url} alt={item.alt || ''} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.alt || 'Product image'}</p><p className="text-xs text-muted-foreground">{item.role || 'other'}</p></div><Button type="button" variant="ghost" size="icon" onClick={() => onImagesChange(images.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>}
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]"><Input placeholder="https://…" value={image.url} onChange={(e) => setImage({ ...image, url: e.target.value })} /><Input placeholder="Alt text" value={image.alt || ''} onChange={(e) => setImage({ ...image, alt: e.target.value })} /><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={image.role} onChange={(e) => setImage({ ...image, role: e.target.value })}><option value="hero">Hero</option><option value="detail">Detail</option><option value="scale">Scale</option><option value="lifestyle">Lifestyle</option><option value="variant">Variant</option><option value="guide">Guide</option><option value="other">Other</option></select><Button type="button" variant="outline" onClick={addImage} disabled={!canAddImage}><ImagePlus className="mr-2 h-4 w-4" />Add</Button></div>
          <p className="text-xs text-muted-foreground">Images are saved with the product when you click “Save product”.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Variants</CardTitle><CardDescription>Maintain SKU, options, price and stock at variant level. Variant changes are saved immediately.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {variants.length > 0 && <div className="space-y-2">{variants.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.sku || 'No SKU'}{Object.keys(item.options || {}).length ? ` · ${optionsText(item.options)}` : ''}</p></div><div className="flex items-center gap-4"><div className="text-right text-sm"><p>{item.currency || currency} {item.price == null ? '—' : Number(item.price).toFixed(2)}</p><p className="text-xs text-muted-foreground">Stock {item.inventory_quantity ?? '—'}</p></div><Button type="button" variant="ghost" size="icon" disabled={saving} onClick={() => deleteVariant(item.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>}
          <div className="grid gap-3 md:grid-cols-2"><div className="space-y-1.5"><Label>Variant title</Label><Input placeholder="Blue / Large" value={variant.title} onChange={(e) => setVariant({ ...variant, title: e.target.value })} /></div><div className="space-y-1.5"><Label>SKU</Label><Input placeholder="SKU-BLU-L" value={variant.sku} onChange={(e) => setVariant({ ...variant, sku: e.target.value })} /></div><div className="space-y-1.5"><Label>Options</Label><Input placeholder="Color=Blue, Size=L" value={variant.options} onChange={(e) => setVariant({ ...variant, options: e.target.value })} /></div><div className="space-y-1.5"><Label>Image URL</Label><Input placeholder="https://…" value={variant.image_url} onChange={(e) => setVariant({ ...variant, image_url: e.target.value })} /></div><div className="space-y-1.5"><Label>Price</Label><Input type="number" min="0" step="0.01" value={variant.price} onChange={(e) => setVariant({ ...variant, price: e.target.value })} /></div><div className="space-y-1.5"><Label>Inventory</Label><Input type="number" min="0" step="1" value={variant.inventory_quantity} onChange={(e) => setVariant({ ...variant, inventory_quantity: e.target.value })} /></div></div>
          <Button type="button" onClick={addVariant} disabled={saving || !variant.title.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Add variant</Button>
        </CardContent>
      </Card>
    </div>
  )
}
