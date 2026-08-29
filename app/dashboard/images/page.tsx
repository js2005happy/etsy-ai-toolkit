'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins, Download, ExternalLink, Image as ImageIcon } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'

const PLATFORMS = [
  { label: 'Etsy Listing (1:1)', size: '1024x1024' },
  { label: 'Instagram Post (1:1)', size: '1024x1024' },
  { label: 'Pinterest Pin (2:3)', size: '1024x1536' },
  { label: 'TikTok / Reels Cover (9:16)', size: '1024x1536' },
  { label: 'YouTube Thumbnail (16:9)', size: '1536x1024' },
  { label: 'Facebook Ad (4:5)', size: '1024x1536' },
]

const STYLES = [
  'Studio product photography',
  'Lifestyle scene',
  'Minimalist',
  'Vintage',
  'Bold & colorful',
]

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Japanese',
  'Korean',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Russian',
  'Arabic',
  'Turkish',
  'Polish',
  'Vietnamese',
  'Thai',
  'No text',
]

interface ProductImageOutput {
  imageUrl: string
  revised_prompt?: string | null
}

export default function ImagesPage() {
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<ProductImageOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    platform: PLATFORMS[0].label,
    style: STYLES[0],
    language: LANGUAGES[0],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const platformObj = PLATFORMS.find((p) => p.label === formData.platform)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: formData.product_name,
          product_description: formData.product_description,
          platform: formData.platform,
          style: formData.style,
          language: formData.language,
          size: platformObj?.size ?? '1024x1024',
        }),
      })

      if (response.status === 401) {
        setError('Please log in to use this tool.')
        return
      }
      if (response.status === 403) {
        setError('Insufficient credits. Please upgrade your plan to generate more images.')
        return
      }
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Something went wrong')
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
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <CinematicBackground theme="social" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Product Image Generator</h1>
          <p className="text-white/60">Create scroll-stopping product posters and banners for Etsy and social platforms.</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Coins className="h-4 w-4" />
            <span>{credits} Credits Left</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="text-white">
          <CardHeader>
            <CardTitle className="font-display">Poster Details</CardTitle>
            <CardDescription className="text-white/60">Describe your product and pick a platform and style.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name" className="text-white/80">Product Name</Label>
                <Input
                  id="product_name"
                  placeholder="e.g. Handmade blue ceramic vase"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description" className="text-white/80">Product Description</Label>
                <Textarea
                  id="product_description"
                  placeholder="e.g. A minimalist ceramic vase with floral patterns, glazed in deep blue, perfect for home decor..."
                  value={formData.product_description}
                  onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                  required
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Visual Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData({ ...formData, style: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Poster Text Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {error && (
            <Card className="border-destructive bg-destructive/10 text-white">
              <CardContent className="pt-6">
                <p className="text-destructive font-medium">{error}</p>
                {error.includes('credits') && (
                  <Button variant="link" className="p-0 h-auto text-destructive mt-2" asChild>
                    <Link href="/pricing">Upgrade Plan &rarr;</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/15 rounded-2xl text-white/50">
              <ImageIcon className="h-12 w-12 mb-4" />
              <p>Describe your product and click generate to get a marketing poster.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">AI is painting your poster...</p>
            </div>
          )}

          {result && (
            <Card className="text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-display">Generated Poster</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(result.imageUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = result.imageUrl
                      a.download = 'product-poster.png'
                      a.target = '_blank'
                      a.rel = 'noopener'
                      a.click()
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.imageUrl}
                    alt="Generated product poster"
                    className="w-full h-auto"
                  />
                </div>
                {result.revised_prompt && (
                  <p className="text-xs text-white/50 whitespace-pre-wrap">
                    {result.revised_prompt}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
