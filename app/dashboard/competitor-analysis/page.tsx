'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import PlatformSelect from '@/components/dashboard/platform-select'
import { useI18n } from '@/lib/i18n/client'

interface CompetitorResult {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  differentiation: string
}

function Quadrant({ title, items, tone }: { title: string; items: string[]; tone: 'positive' | 'negative' }) {
  const color = tone === 'positive' ? 'text-emerald-600' : 'text-rose-500'
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-semibold font-display ${color}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="text-sm leading-relaxed flex gap-2 items-start">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function CompetitorAnalysisPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<CompetitorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [competitorName, setCompetitorName] = useState('')
  const [competitorDescription, setCompetitorDescription] = useState('')
  const [platform, setPlatform] = useState('etsy')

  useEffect(() => {
    fetch('/api/user/credits')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCredits(d.credits_remaining ?? d.credits))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/generate-competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          product_description: productDescription,
          competitor_name: competitorName,
          competitor_description: competitorDescription,
          platform,
        }),
      })
      if (res.status === 401) { setError(t('dashboardTools.common.logIn')); return }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('dashboardTools.common.somethingWrong'))
      }
      const data = await res.json()
      setResult(data)
      fetch('/api/user/credits').then((r) => r.ok && r.json()).then((d) => d && setCredits(d.credits_remaining ?? d.credits)).catch(() => {})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <CinematicBackground theme="optimizer" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{t('dashboardTools.competitor.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.competitor.sub')}</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Coins className="h-4 w-4" />
            <span>{credits} {t('dashboardTools.common.creditsLeft')}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">{t('dashboardTools.competitor.vsTitle')}</CardTitle>
            <CardDescription>{t('dashboardTools.competitor.vsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">{t('dashboardTools.competitor.yourProductName')}</Label>
                <Input id="product_name" placeholder={t('dashboardTools.competitor.yourProductNamePh')} value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description">{t('dashboardTools.competitor.yourProductDesc')}</Label>
                <Textarea id="product_description" placeholder={t('dashboardTools.competitor.yourProductDescPh')} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor_name">{t('dashboardTools.competitor.competitorName')}</Label>
                <Input id="competitor_name" placeholder={t('dashboardTools.competitor.competitorNamePh')} value={competitorName} onChange={(e) => setCompetitorName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor_description">{t('dashboardTools.competitor.competitorDesc')}</Label>
                <Textarea id="competitor_description" placeholder={t('dashboardTools.competitor.competitorDescPh')} value={competitorDescription} onChange={(e) => setCompetitorDescription(e.target.value)} rows={3} />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('dashboardTools.competitor.analyzing')}</>) : t('dashboardTools.competitor.analyze')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6"><p className="text-destructive font-medium">{error}</p></CardContent>
            </Card>
          )}
          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
              <p>{t('dashboardTools.competitor.empty')}</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.competitor.loading')}</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Quadrant title={t('dashboardTools.competitor.theirStrengths')} items={result.strengths} tone="negative" />
                <Quadrant title={t('dashboardTools.competitor.theirWeaknesses')} items={result.weaknesses} tone="positive" />
                <Quadrant title={t('dashboardTools.competitor.yourOpportunities')} items={result.opportunities} tone="positive" />
                <Quadrant title={t('dashboardTools.competitor.threats')} items={result.threats} tone="negative" />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold font-display">{t('dashboardTools.competitor.differentiate')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.differentiation}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
