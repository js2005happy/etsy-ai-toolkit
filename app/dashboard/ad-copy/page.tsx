'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, Check, Coins } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import PlatformSelect from '@/components/dashboard/platform-select'
import { useI18n } from '@/lib/i18n/client'

interface AdCopyResult {
  headlines: string[]
  primary_text: string
  description: string
  cta: string
}

const GOALS = [
  { id: 'conversions', labelKey: 'goalConversions' },
  { id: 'traffic', labelKey: 'goalTraffic' },
  { id: 'brand_awareness', labelKey: 'goalBrandAwareness' },
  { id: 'engagement', labelKey: 'goalEngagement' },
  { id: 'sales', labelKey: 'goalSales' },
]

export default function AdCopyPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<AdCopyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [platform, setPlatform] = useState('etsy')
  const [goal, setGoal] = useState('conversions')
  const [audience, setAudience] = useState('')

  useEffect(() => {
    fetch('/api/user/credits')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCredits(d.credits_remaining ?? d.credits))
      .catch(() => {})
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
    setResult(null)
    try {
      const res = await fetch('/api/generate-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName, product_description: productDescription, platform, goal, audience }),
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
      <CinematicBackground theme="social" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{t('dashboardTools.adCopy.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.adCopy.sub')}</p>
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
            <CardTitle className="font-display">{t('dashboardTools.adCopy.brief')}</CardTitle>
            <CardDescription>{t('dashboardTools.adCopy.briefDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">{t('dashboardTools.common.productName')}</Label>
                <Input id="product_name" placeholder={t('dashboardTools.adCopy.productNamePh')} value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description">{t('dashboardTools.common.productDescription')}</Label>
                <Textarea id="product_description" placeholder={t('dashboardTools.adCopy.productDescPh')} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows={3} />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <div className="space-y-2">
                <Label>{t('dashboardTools.adCopy.campaignGoal')}</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{t(`dashboardTools.adCopy.${g.labelKey}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">{t('dashboardTools.adCopy.targetAudience')}</Label>
                <Input id="audience" placeholder={t('dashboardTools.adCopy.targetAudiencePh')} value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('dashboardTools.adCopy.writing')}</>) : t('dashboardTools.adCopy.generate')}
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
              <p>{t('dashboardTools.adCopy.empty')}</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.adCopy.loading')}</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.adCopy.headlines')}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.headlines.join('\n'), 'headlines')}>
                    {copiedField === 'headlines' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.headlines.map((h, i) => (
                      <li key={i} className="text-sm leading-relaxed border-l-2 border-primary/30 pl-3">{h}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.adCopy.primaryText')}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.primary_text, 'primary')}>
                    {copiedField === 'primary' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{result.primary_text}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.adCopy.descCta')}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.description + '\n' + result.cta, 'desc')}>
                    {copiedField === 'desc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.description}</p>
                  <span className="mt-2 inline-block px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold">{result.cta}</span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
