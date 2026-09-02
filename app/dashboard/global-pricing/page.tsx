'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import { MARKETS, formatMoney, type MarketBreakdown } from '@/lib/global-pricing'
import { useI18n } from '@/lib/i18n/client'

export default function GlobalPricingPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [basePrice, setBasePrice] = useState('')
  const [productName, setProductName] = useState('')
  const [selected, setSelected] = useState<string[]>(['US', 'UK', 'EU'])
  const [result, setResult] = useState<MarketBreakdown[] | null>(null)
  const [strategy, setStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits_remaining ?? data.credits ?? null)
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const toggleMarket = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setStrategy('')
    try {
      const res = await fetch('/api/global-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_price: basePrice,
          product_name: productName,
          markets: selected,
        }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.status === 403) {
        setError(t('dashboardTools.common.insufficientCredits'))
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('dashboardTools.common.somethingWrong'))
        return
      }
      const data = await res.json()
      setResult(data.markets)
      setStrategy(data.strategy || '')
      fetchCredits()
    } catch (err: any) {
      setError(err.message || t('dashboardTools.common.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="default" />
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.globalPricing.h1')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('dashboardTools.globalPricing.sub')}
          </p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.globalPricing.yourProduct')}</CardTitle>
            <CardDescription>{t('dashboardTools.globalPricing.yourProductDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="product_name">{t('dashboardTools.globalPricing.productNameOpt')}</Label>
                  <Input
                    id="product_name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={t('dashboardTools.globalPricing.productNamePh')}
                  />
                </div>
                <div>
                  <Label htmlFor="base_price">{t('dashboardTools.globalPricing.basePrice')}</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder={t('dashboardTools.globalPricing.basePricePh')}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>{t('dashboardTools.globalPricing.targetMarkets')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MARKETS.map((m) => {
                    const active = selected.includes(m.code)
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => toggleMarket(m.code)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-card text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {m.code} · {m.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || selected.length === 0}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? t('dashboardTools.globalPricing.comparing') : t('dashboardTools.globalPricing.compare')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-5">
            {result.map((market) => (
              <Card key={market.code} className="rounded-xl border-border bg-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-foreground">
                      {market.code}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{market.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {market.currency} · ~{market.rate} {t('dashboardTools.globalPricing.perUsd')} · {Math.round(market.markup * 100)}% {t('dashboardTools.globalPricing.localPremium')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('dashboardTools.globalPricing.landedPrice')}</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatMoney(market.localPrice, market.currency, market.symbol)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {market.platforms
                    .slice()
                    .sort((a, b) => b.net - a.net)
                    .map((p, i) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          i === 0 ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {p.name}
                            {i === 0 && (
                              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {t('dashboardTools.globalPricing.bestPayout')}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.note} · {Math.round(p.feePct * 100)}% {t('dashboardTools.globalPricing.fee')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            −{formatMoney(p.fee, market.currency, market.symbol)}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatMoney(p.net, market.currency, market.symbol)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}

            {strategy && (
              <Card className="rounded-xl border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">{t('dashboardTools.globalPricing.pricingStrategy')}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {strategy}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
