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
import PlatformSelect from '@/components/dashboard/platform-select'
import { useI18n } from '@/lib/i18n/client'

interface MessageReplyOutput {
  replies: string[]
}

export default function MessagesPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<MessageReplyOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creditError, setCreditError] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    customer_message: '',
    product_info: '',
    tone: 'friendly',
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

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCreditError(false)
    setResult(null)

    try {
      const response = await fetch('/api/generate-message-reply', {
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
      <CinematicBackground theme="messages" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('dashboardTools.messages.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.messages.sub')}</p>
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
            <CardTitle className="font-display">{t('dashboardTools.messages.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.messages.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer_message">{t('dashboardTools.messages.customerMessage')}</Label>
                <Textarea
                  id="customer_message"
                  placeholder={t('dashboardTools.messages.customerMessagePh')}
                  value={formData.customer_message}
                  onChange={(e) => setFormData({ ...formData, customer_message: e.target.value })}
                  required
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_info">{t('dashboardTools.messages.productInfo')}</Label>
                <Input
                  id="product_info"
                  placeholder={t('dashboardTools.messages.productInfoPh')}
                  value={formData.product_info}
                  onChange={(e) => setFormData({ ...formData, product_info: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">{t('dashboardTools.messages.tone')}</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('dashboardTools.messages.selectTone')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">{t('dashboardTools.messages.friendlyWarm')}</SelectItem>
                    <SelectItem value="professional">{t('dashboardTools.messages.professionalFormal')}</SelectItem>
                    <SelectItem value="apologetic">{t('dashboardTools.messages.apologeticEmpathetic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PlatformSelect value={formData.platform} onChange={(v) => setFormData({ ...formData, platform: v })} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dashboardTools.messages.generating')}
                  </>
                ) : (
                  t('dashboardTools.messages.generate')
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
              <p>{t('dashboardTools.messages.empty')}</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">{t('dashboardTools.messages.loading')}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-display">{t('dashboardTools.messages.suggested')}</h3>
              {result.replies.map((reply, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCopy(reply, index)}
                      >
                        {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div >
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
