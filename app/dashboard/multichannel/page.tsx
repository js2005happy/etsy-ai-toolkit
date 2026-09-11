'use client'

import { useMemo, useState } from 'react'
import { Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProductReadinessPanel from '@/components/dashboard/product-readiness-panel'

const CHANNELS = [
  ['etsy', 'Etsy'],
  ['shopify', 'Shopify'],
  ['woocommerce', 'WooCommerce'],
  ['amazon', 'Amazon'],
  ['ebay', 'eBay'],
  ['tiktok', 'TikTok Shop'],
  ['walmart', 'Walmart'],
  ['google', 'Google Shopping'],
] as const

function parseFacts(text: string): Record<string, string> {
  return Object.fromEntries(
    text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const i = line.indexOf(':')
      return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : ['', '']
    }).filter(([key, value]) => key && value)
  )
}

export default function MultichannelPage() {
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('')
  const [material, setMaterial] = useState('')
  const [style, setStyle] = useState('')
  const [factsText, setFactsText] = useState('')
  const [selected, setSelected] = useState<string[]>(['etsy', 'shopify', 'woocommerce'])
  const [previews, setPreviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const selectedLabel = useMemo(() => `${selected.length}/5 channels selected`, [selected])

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 5) return current
      return [...current, id]
    })
  }

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1400)
  }

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPreviews([])
    try {
      const response = await fetch('/api/multichannel/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          product_type: productType,
          material,
          style,
          facts: parseFacts(factsText),
          platforms: selected,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to generate previews')
      setPreviews(data.previews || [])
    } catch (err: any) {
      setError(err.message || 'Unable to generate previews')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Multichannel Commerce</p>
        <h1 className="mt-1 font-display text-3xl font-bold">One product, every marketplace</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">Enter verified product facts once. Craftly adapts the same product to each channel instead of copying one marketplace listing everywhere.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Canonical product</CardTitle>
            <CardDescription>These facts remain the source of truth across channels.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generate} className="space-y-5">
              <div className="space-y-2"><Label>Product name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Product type</Label><Input value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="necklace, hoodie, printable planner..." required /></div>
              <div className="space-y-2"><Label>Material</Label><Input value={material} onChange={(e) => setMaterial(e.target.value)} /></div>
              <div className="space-y-2"><Label>Style</Label><Input value={style} onChange={(e) => setStyle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Verified facts</Label><Textarea rows={8} value={factsText} onChange={(e) => setFactsText(e.target.value)} placeholder={'dimensions: 18 x 12 cm\ncare: wipe clean\nproduction time: 3-5 business days'} /><p className="text-xs text-muted-foreground">One key: value fact per line.</p></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Sales channels</Label><span className="text-xs text-muted-foreground">{selectedLabel}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {CHANNELS.map(([id, label]) => {
                    const active = selected.includes(id)
                    return <button key={id} type="button" onClick={() => toggle(id)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}>{active && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}{label}</button>
                  })}
                </div>
              </div>

              <Button className="w-full" disabled={loading || selected.length < 2}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adapting product…</> : 'Generate channel previews'}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {!loading && previews.length === 0 && <div className="flex min-h-80 items-center justify-center rounded-xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">Choose 2-5 channels to compare platform-specific versions side by side.</div>}
          {loading && <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
          {previews.map((preview) => {
            const channel = CHANNELS.find(([id]) => id === preview.platform)?.[1] || preview.platform
            return <Card key={preview.platform}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4"><div><CardTitle>{channel}</CardTitle><CardDescription>{preview.product_profile} · {preview.readiness_score}% source readiness</CardDescription></div><Button size="sm" variant="outline" onClick={() => copy(preview.platform, `${preview.title}\n\n${preview.description}\n\n${(preview.tags || []).join(', ')}`)}>{copied === preview.platform ? 'Copied' : <><Copy className="mr-1 h-3.5 w-3.5" />Copy</>}</Button></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProductReadinessPanel data={preview} />
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</p><p className="mt-1 font-medium">{preview.title}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{preview.description}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keywords / tags</p><div className="mt-2 flex flex-wrap gap-2">{(preview.tags || []).map((tag: string) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs">{tag}</span>)}</div></div>
              </CardContent>
            </Card>
          })}
        </div>
      </div>
    </div>
  )
}
