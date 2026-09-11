'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import PlatformSelect from '@/components/dashboard/platform-select'
import ProductReadinessPanel from '@/components/dashboard/product-readiness-panel'
import { useI18n } from '@/lib/i18n/client'

function parseFacts(text: string): Record<string, string> {
  return Object.fromEntries(
    text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const i = line.indexOf(':')
      return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : ['', '']
    }).filter(([key, value]) => key && value)
  )
}

export default function OptimizerPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [currentTitle, setCurrentTitle] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const [currentTags, setCurrentTags] = useState('')
  const [productType, setProductType] = useState('')
  const [material, setMaterial] = useState('')
  const [facts, setFacts] = useState('')
  const [platform, setPlatform] = useState('etsy')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits ?? data.credits_remaining ?? null)
      }
    } catch {}
  }

  useEffect(() => { fetchCredits() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_title: currentTitle,
          current_description: currentDescription,
          current_tags: currentTags,
          product_type: productType,
          material,
          facts: parseFacts(facts),
          platform,
        }),
      })
      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return }
      const data = await res.json()
      if (!res.ok) { setError(data.error || t('dashboardTools.common.somethingWrong')); return }
      setResult(data)
      fetchCredits()
    } catch (err: any) {
      setError(err.message || t('dashboardTools.common.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string) => navigator.clipboard.writeText(text)

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="optimizer" />
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.optimizer.h1')}</h1>
          <p className="mt-2 text-muted-foreground">{t('dashboardTools.optimizer.sub')}</p>
          <p className="mt-1 text-sm text-muted-foreground">The optimizer now checks category-critical facts before rewriting the listing.</p>
          {credits !== null && <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.optimizer.currentListing')}</CardTitle>
            <CardDescription>{t('dashboardTools.optimizer.currentListingDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 p-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><Label htmlFor="current_title">{t('dashboardTools.optimizer.currentTitle')}</Label><Input id="current_title" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} /></div>
              <div><Label htmlFor="current_description">{t('dashboardTools.optimizer.currentDesc')}</Label><Textarea id="current_description" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} rows={7} /></div>
              <div><Label htmlFor="current_tags">{t('dashboardTools.optimizer.currentTags')}</Label><Input id="current_tags" value={currentTags} onChange={(e) => setCurrentTags(e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="product_type">Product type</Label><Input id="product_type" placeholder="necklace, hoodie, template..." value={productType} onChange={(e) => setProductType(e.target.value)} /></div>
                <div><Label htmlFor="material">Verified material</Label><Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} /></div>
              </div>
              <div><Label htmlFor="facts">Verified facts</Label><Textarea id="facts" rows={5} value={facts} onChange={(e) => setFacts(e.target.value)} placeholder={'size range: S-XL\ncare: cold wash\nproduction time: 2-4 business days'} /><p className="mt-1 text-xs text-muted-foreground">One key: value fact per line. Missing facts will be flagged, not guessed.</p></div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">{loading ? t('dashboardTools.optimizer.optimizing') : t('dashboardTools.optimizer.optimize')}</Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {result && <div className="space-y-4">
          <ProductReadinessPanel data={result} />
          {result.title && <Card className="rounded-xl border-border bg-card p-4"><div className="flex justify-between gap-4"><div><h4 className="mb-1 text-sm font-semibold text-muted-foreground">{t('dashboardTools.optimizer.optTitle')}</h4><p className="text-sm">{result.title}</p></div><Button variant="ghost" size="sm" onClick={() => copy(result.title)}>{t('dashboardTools.common.copy')}</Button></div></Card>}
          {result.description && <Card className="rounded-xl border-border bg-card p-4"><div className="flex justify-between gap-4"><div><h4 className="mb-1 text-sm font-semibold text-muted-foreground">{t('dashboardTools.optimizer.optDesc')}</h4><p className="whitespace-pre-wrap text-sm">{result.description}</p></div><Button variant="ghost" size="sm" onClick={() => copy(result.description)}>{t('dashboardTools.common.copy')}</Button></div></Card>}
          {result.tags?.length > 0 && <Card className="rounded-xl border-border bg-card p-4"><div className="flex justify-between gap-4"><div><h4 className="mb-1 text-sm font-semibold text-muted-foreground">{t('dashboardTools.optimizer.optTags')}</h4><p className="text-sm">{result.tags.join(', ')}</p></div><Button variant="ghost" size="sm" onClick={() => copy(result.tags.join(', '))}>{t('dashboardTools.common.copy')}</Button></div></Card>}
          {result.suggestions && <Card className="rounded-xl border-border bg-card p-4"><h4 className="mb-1 text-sm font-semibold">{t('dashboardTools.optimizer.suggestions')}</h4><p className="whitespace-pre-wrap text-sm">{result.suggestions}</p></Card>}
        </div>}
      </div>
    </div>
  )
}
