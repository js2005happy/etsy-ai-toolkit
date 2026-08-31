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

interface EmailResult {
  subject: string
  preview_text: string
  body: string
}

const EMAIL_TYPES = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'abandoned_cart', label: 'Abandoned cart' },
  { id: 'order_confirmation', label: 'Order confirmation' },
  { id: 'shipping_update', label: 'Shipping update' },
  { id: 'promotional', label: 'Promotional' },
  { id: 'win_back', label: 'Win back' },
]

export default function EmailPage() {
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<EmailResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [emailType, setEmailType] = useState('welcome')
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
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
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_type: emailType, product_name: productName, product_description: productDescription, audience }),
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
      <CinematicBackground theme="messages" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Email Writer</h1>
          <p className="text-muted-foreground">Write warm, human marketing emails for every stage of the buyer journey.</p>
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
            <CardTitle className="font-display">Email Brief</CardTitle>
            <CardDescription>Pick the email type and describe the product.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input id="product_name" placeholder="e.g. Handmade Ceramic Mug" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_description">Product Description</Label>
                <Textarea id="product_description" placeholder="What are you selling?" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience (optional)</Label>
                <Input id="audience" placeholder="e.g. past customers, newsletter subscribers" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Writing email…</>) : 'Write Email'}
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
              <p>Your email will appear here.</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Writing your email…</p>
            </div>
          )}
          {result && (
            <Card>
              <CardHeader className="space-y-0 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium font-display">Subject</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.subject, 'subject')}>
                    {copiedField === 'subject' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-base font-medium">{result.subject}</p>
                <p className="text-xs text-muted-foreground">{result.preview_text}</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.body, 'body')}>
                    {copiedField === 'body' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed rounded-lg bg-secondary/50 p-4">{result.body}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
