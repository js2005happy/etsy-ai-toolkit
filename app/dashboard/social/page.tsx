'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Check, Coins } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import { PLATFORMS } from '@/lib/platforms'
import { useI18n } from '@/lib/i18n/client'

const SOCIAL_PLATFORMS = PLATFORMS.filter((p) =>
  ['instagram', 'pinterest', 'tiktok'].includes(p.id)
)

interface SocialPostOutput {
  caption: string
  hashtags: string[]
}

export default function SocialPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<SocialPostOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creditError, setCreditError] = useState(false)
  const [copiedField, setCopiedField] = useState<'caption' | 'hashtags' | null>(null)

  const [formData, setFormData] = useState({
    product_description: '',
    platform: 'instagram',
  })

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/user/credits')
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch (e) {
        console.error('Failed to fetch credits', e)
      }
    }
    fetchCredits()
  }, [])

  const handleCopy = async (text: string, field: 'caption' | 'hashtags') => {
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
      const response = await fetch('/api/generate-social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        setError(t('dashboardTools.common.logIn'))
        return
      }
      if (response.status === 403) {
        setCreditError(true)
        setError(t('dashboardTools.common.insufficientCredits'))
        return
      }
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('dashboardTools.common.somethingWrong'))
      }

      const data = await response.json()
      setResult(data)

      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const creditData = await res.json()
        setCredits(creditData.credits)
      }
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
          <h1 className="text-3xl font-bold font-display">{t('dashboardTools.social.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.social.sub')}</p>
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
            <CardTitle className="font-display">{t('dashboardTools.social.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.social.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_description">{t('dashboardTools.common.productDescription')}</Label>
                <Textarea
                  id="product_description"
                  placeholder={t('dashboardTools.social.productDescPh')}
                  value={formData.product_description}
                  onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                  required
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">{t('dashboardTools.social.platform')}</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('dashboardTools.social.selectPlatform')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dashboardTools.social.generating')}
                  </>
                ) : (
                  t('dashboardTools.social.generate')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive font-medium">{error}</p>
                {creditError && (
                  <Button variant="link" className="p-0 h-auto text-destructive mt-2" asChild>
                    <Link href="/pricing">
                      {t('dashboardTools.common.upgradePlan')} &rarr;
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
              <p>{t('dashboardTools.social.empty')}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.social.loading')}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.social.caption')}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.caption, 'caption')}
                  >
                    {copiedField === 'caption' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-lg whitespace-pre-wrap">{result.caption}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.social.hashtags')}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.hashtags.join(' '), 'hashtags')}
                  >
                    {copiedField === 'hashtags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
