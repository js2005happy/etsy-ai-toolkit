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
      if (res.status === 401) { setError('Please log in to use this tool.'); return }
      if (res.status === 403) { setError('Insufficient credits. Please upgrade your plan.'); return }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
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
          <h1 className="text-3xl font-bold font-display text-foreground">Competitor Analysis</h1>
          <p className="text-muted-foreground">A quick SWOT read on a competitor so you can position to win.</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Coins className="h-4 w-4" />
            <span>{credits} Credits Left</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Your Product vs. Competitor</CardTitle>
            <CardDescription>Describe your product, then the competitor you want to beat.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">Your Product Name</Label>
                <Input id="product_name" placeholder="e.g. Handmade Ceramic Mug" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description">Your Product Description</Label>
                <Textarea id="product_description" placeholder="What you sell and why it's good" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor_name">Competitor Name (optional)</Label>
                <Input id="competitor_name" placeholder="e.g. BestSeller Shop" value={competitorName} onChange={(e) => setCompetitorName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitor_description">Competitor Description (optional)</Label>
                <Textarea id="competitor_description" placeholder="What you know about their product" value={competitorDescription} onChange={(e) => setCompetitorDescription(e.target.value)} rows={3} />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</>) : 'Analyze Competitor'}
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
              <p>Your analysis will appear here.</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Analyzing the competition…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Quadrant title="Their strengths" items={result.strengths} tone="negative" />
                <Quadrant title="Their weaknesses" items={result.weaknesses} tone="positive" />
                <Quadrant title="Your opportunities" items={result.opportunities} tone="positive" />
                <Quadrant title="Threats to watch" items={result.threats} tone="negative" />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold font-display">How to differentiate</CardTitle>
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
