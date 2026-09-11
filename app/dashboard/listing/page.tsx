'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Copy, Check, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import PlatformSelect from '@/components/dashboard/platform-select'
import ProductReadinessPanel, { type ProductReadinessPayload } from '@/components/dashboard/product-readiness-panel'
import { useI18n } from '@/lib/i18n/client'

interface ListingResult extends ProductReadinessPayload {
  title: string
  description: string
  tags: string[]
}

function parseFacts(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf(':')
        return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : ['', '']
      })
      .filter(([key, value]) => key && value)
  )
}

export default function ListingPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creditError, setCreditError] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [factsText, setFactsText] = useState('')
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    material: '',
    style: '',
    platform: 'etsy',
  })

  useEffect(() => {
    fetch('/api/user/credits')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setCredits(data.credits ?? data.credits_remaining ?? null))
      .catch(() => undefined)
  }, [])

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreditError(false)
    setResult(null)
    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, facts: parseFacts(factsText) }),
      })
      if (response.status === 401) { setError(t('dashboardTools.common.logIn')); return }
      if (response.status === 403) { setCreditError(true); setError(t('dashboardTools.common.insufficientCredits')); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('dashboardTools.common.somethingWrong'))
      setResult(data)
      const creditRes = await fetch('/api/user/credits')
      if (creditRes.ok) {
        const creditData = await creditRes.json()
        setCredits(creditData.credits ?? creditData.credits_remaining ?? null)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <CinematicBackground theme="listing" />
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{t('dashboardTools.listing.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.listing.sub')}</p>
          <p className="mt-2 text-sm text-muted-foreground">Craftly now checks category-specific facts before it writes. Missing facts are flagged instead of invented.</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Coins className="h-4 w-4" /> {credits} {t('dashboardTools.common.creditsLeft')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">{t('dashboardTools.listing.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.listing.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="product_name">{t('dashboardTools.common.productName')}</Label>
                <Input id="product_name" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">{t('dashboardTools.common.productType')}</Label>
                <Input id="product_type" placeholder="e.g. necklace, hoodie, printable planner, serum" value={formData.product_type} onChange={(e) => setFormData({ ...formData, product_type: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="material">{t('dashboardTools.common.material')}</Label>
                  <Input id="material" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} placeholder="Only if verified" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style">{t('dashboardTools.common.style')}</Label>
                  <Input id="style" value={formData.style} onChange={(e) => setFormData({ ...formData, style: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facts">Verified product facts</Label>
                <Textarea
                  id="facts"
                  value={factsText}
                  onChange={(e) => setFactsText(e.target.value)}
                  rows={7}
                  placeholder={'One fact per line, for example:\ndimensions: 18 x 12 cm\ncare: hand wash only\nclosure: lobster clasp\nproduction time: 3-5 business days'}
                />
                <p className="text-xs text-muted-foreground">Use key: value lines. Do not add facts you cannot verify.</p>
              </div>
              <PlatformSelect value={formData.platform} onChange={(platform) => setFormData({ ...formData, platform })} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('dashboardTools.listing.generating')}</> : t('dashboardTools.listing.generate')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {error && (
            <Card className="border-destructive bg-destructive/10"><CardContent className="pt-6">
              <p className="font-medium text-destructive">{error}</p>
              {creditError && <Button variant="link" className="mt-2 h-auto p-0 text-destructive" asChild><Link href="/pricing">{t('dashboardTools.common.upgradePlan')} &rarr;</Link></Button>}
            </CardContent></Card>
          )}
          {loading && <div className="flex min-h-72 flex-col items-center justify-center"><Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" /><p>{t('dashboardTools.listing.loading')}</p></div>}
          {!result && !loading && !error && <div className="flex min-h-72 items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">{t('dashboardTools.listing.empty')}</div>}

          {result && <ProductReadinessPanel data={result} />}

          {result && (
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="title">{t('dashboardTools.listing.titleTab')}</TabsTrigger>
                <TabsTrigger value="description">{t('dashboardTools.listing.descTab')}</TabsTrigger>
                <TabsTrigger value="tags">{t('dashboardTools.listing.tagsTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="title"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{t('dashboardTools.listing.optTitle')}</CardTitle><Button variant="ghost" size="sm" onClick={() => handleCopy(result.title, 'title')}>{copiedField === 'title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></CardHeader><CardContent><p className="text-lg">{result.title}</p></CardContent></Card></TabsContent>
              <TabsContent value="description"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{t('dashboardTools.listing.optDesc')}</CardTitle><Button variant="ghost" size="sm" onClick={() => handleCopy(result.description, 'description')}>{copiedField === 'description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></CardHeader><CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{result.description}</div></CardContent></Card></TabsContent>
              <TabsContent value="tags"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{t('dashboardTools.listing.optTags')}</CardTitle><Button variant="ghost" size="sm" onClick={() => handleCopy(result.tags.join(', '), 'tags')}>{copiedField === 'tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></CardHeader><CardContent><div className="flex flex-wrap gap-2">{result.tags.map((tag) => <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">{tag}</span>)}</div></CardContent></Card></TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
