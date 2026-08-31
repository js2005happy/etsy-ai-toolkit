'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Check, Coins } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'

interface BrandStoryResult {
  story: string
  mission: string
  tagline: string
}

export default function BrandStoryPage() {
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<BrandStoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [brandName, setBrandName] = useState('')
  const [productType, setProductType] = useState('')
  const [originStory, setOriginStory] = useState('')
  const [values, setValues] = useState('')
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
      const res = await fetch('/api/generate-brand-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_name: brandName, product_type: productType, origin_story: originStory, values, audience }),
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
      <CinematicBackground theme="announcement" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Brand Story</h1>
          <p className="text-muted-foreground">Tell the story behind your shop — like a real founder would.</p>
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
            <CardTitle className="font-display">About Your Brand</CardTitle>
            <CardDescription>Share a few details and we'll shape them into a story.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand_name">Brand Name</Label>
                <Input id="brand_name" placeholder="e.g. Cedar & Clay" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">What You Make</Label>
                <Input id="product_type" placeholder="e.g. handmade ceramics" value={productType} onChange={(e) => setProductType(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin_story">Origin Story (optional)</Label>
                <Textarea id="origin_story" placeholder="How did you start? What drove you to create?" value={originStory} onChange={(e) => setOriginStory(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="values">Core Values (optional)</Label>
                <Input id="values" placeholder="e.g. sustainability, craft, slow living" value={values} onChange={(e) => setValues(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Who You Serve (optional)</Label>
                <Input id="audience" placeholder="e.g. thoughtful gift givers" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Writing your story…</>) : 'Write Brand Story'}
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
              <p>Your brand story will appear here.</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Writing your story…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium font-display">Tagline</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-lg font-medium italic">“{result.tagline}”</p>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.tagline, 'tagline')}>
                    {copiedField === 'tagline' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium font-display">Mission</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.mission, 'mission')}>
                    {copiedField === 'mission' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{result.mission}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium font-display">Your Story</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.story, 'story')}>
                    {copiedField === 'story' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{result.story}</div></CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
