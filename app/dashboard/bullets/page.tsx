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

export default function BulletsPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [platform, setPlatform] = useState('etsy')
  const [count, setCount] = useState('5')

  useEffect(() => {
    fetch('/api/user/credits')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCredits(d.credits_remaining ?? d.credits))
      .catch(() => {})
  }, [])

  const refreshCredits = () => {
    fetch('/api/user/credits')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCredits(d.credits_remaining ?? d.credits))
      .catch(() => {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult([])
    try {
      const res = await fetch('/api/generate-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          product_description: productDescription,
          platform,
          count: parseInt(count, 10),
        }),
      })
      if (res.status === 401) { setError(t('dashboardTools.common.logIn')); return }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('dashboardTools.common.somethingWrong'))
      }
      const data = await res.json()
      setResult(data.bullets || [])
      refreshCredits()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(result.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <CinematicBackground theme="listing" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{t('dashboardTools.bullets.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.bullets.sub')}</p>
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
            <CardTitle className="font-display">{t('dashboardTools.bullets.product')}</CardTitle>
            <CardDescription>{t('dashboardTools.bullets.productDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">{t('dashboardTools.common.productName')}</Label>
                <Input id="product_name" placeholder={t('dashboardTools.bullets.productNamePh')} value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description">{t('dashboardTools.common.productDescription')}</Label>
                <Textarea id="product_description" placeholder={t('dashboardTools.bullets.productDescPh')} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows={4} />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <div className="space-y-2">
                <Label>{t('dashboardTools.bullets.numberOfBullets')}</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} {t('dashboardTools.bullets.bulletsUnit')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('dashboardTools.bullets.writing')}</>) : t('dashboardTools.bullets.generate')}
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
          {!result.length && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
              <p>{t('dashboardTools.bullets.empty')}</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.bullets.loading')}</p>
            </div>
          )}
          {result.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.bullets.result')}</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyAll}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.map((b, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
