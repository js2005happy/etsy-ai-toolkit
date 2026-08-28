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

interface ListingResult {
  title: string
  description: string
  tags: string[]
}

export default function ListingPage() {
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    material: '',
    style: '',
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
    setResult(null)

    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        setError('Please log in to use this tool.')
        return
      }
      if (response.status === 403) {
        setError('Insufficient credits. Please upgrade your plan to generate more listings.')
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
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Etsy Listing Generator</h1>
          <p className="text-muted-foreground">Generate SEO-optimized titles, descriptions, and tags for your products.</p>
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
            <CardTitle className="font-display">Product Details</CardTitle>
            <CardDescription>Fill in the information below to generate your listing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input 
                  id="product_name" 
                  placeholder="e.g. Handmade Ceramic Mug" 
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Input 
                  id="product_type" 
                  placeholder="e.g. Kitchenware" 
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  id="material" 
                  placeholder="e.g. Stoneware Clay" 
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input 
                  id="style" 
                  placeholder="e.g. Minimalist, Boho" 
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Listing'
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
                {error.includes('credits') && (
                  <Button variant="link" className="p-0 h-auto text-destructive mt-2" asChild>
  <Link href="/settings">
    Upgrade Plan &rarr;
  </Link>
</Button>
                )}
              </CardContent>
            </Card>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#d2d2d7] rounded-2xl text-muted-foreground">
              <p>Fill out the form and click generate to see the magic!</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">AI is crafting your listing...</p>
            </div>
          )}

          {result && (
            <Tabs defaultValue="title" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="title">Title</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>
              
              <TabsContent value="title">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-display">Optimized Title</CardTitle>
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
                    <CardTitle className="text-sm font-medium font-display">Engaging Description</CardTitle>
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
                    <CardTitle className="text-sm font-medium font-display">SEO Tags</CardTitle>
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