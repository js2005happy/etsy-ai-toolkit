'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Copy, Check, Coins } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import PlatformSelect from '@/components/dashboard/platform-select'
import { useI18n } from '@/lib/i18n/client'

interface ListingResult {
  title: string
  description: string
  tags: string[]
}

export default function ListingPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creditError, setCreditError] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    material: '',
    style: '',
    platform: 'etsy',
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
      <CinematicBackground theme="listing" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('dashboardTools.listing.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.listing.sub')}</p>
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
            <CardTitle className="font-display">{t('dashboardTools.listing.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.listing.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">{t('dashboardTools.common.productName')}</Label>
                <Input
                  id="product_name"
                  placeholder={t('dashboardTools.listing.productNamePh')}
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">{t('dashboardTools.common.productType')}</Label>
                <Input
                  id="product_type"
                  placeholder={t('dashboardTools.listing.productTypePh')}
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">{t('dashboardTools.common.material')}</Label>
                <Input
                  id="material"
                  placeholder={t('dashboardTools.listing.materialPh')}
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">{t('dashboardTools.common.style')}</Label>
                <Input
                  id="style"
                  placeholder={t('dashboardTools.listing.stylePh')}
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  required
                />
              </div>
              <PlatformSelect value={formData.platform} onChange={(v) => setFormData({ ...formData, platform: v })} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dashboardTools.listing.generating')}
                  </>
                ) : (
                  t('dashboardTools.listing.generate')
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
              <p>{t('dashboardTools.listing.empty')}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.listing.loading')}</p>
            </div>
          )}

          {result && (
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="title">{t('dashboardTools.listing.titleTab')}</TabsTrigger>
                <TabsTrigger value="description">{t('dashboardTools.listing.descTab')}</TabsTrigger>
                <TabsTrigger value="tags">{t('dashboardTools.listing.tagsTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="title">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.listing.optTitle')}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.title, 'title')}
                    >
                      {copiedField === 'title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{result.title}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="description">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.listing.optDesc')}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.description, 'description')}
                    >
                      {copiedField === 'description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {result.description}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tags">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-display">{t('dashboardTools.listing.optTags')}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.tags.join(', '), 'tags')}
                    >
                      {copiedField === 'tags' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
