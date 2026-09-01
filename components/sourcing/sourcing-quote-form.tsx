'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export default function SourcingQuoteForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    const message = [
      'New sourcing request',
      '',
      `Product: ${product}`,
      quantity ? `Quantity / budget: ${quantity}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      })
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus('sent')
      setName('')
      setEmail('')
      setProduct('')
      setQuantity('')
      setNotes('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Honeypot field — hidden from humans */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">What do you want to source?</Label>
        <Textarea
          id="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g. Handmade ceramic mugs, 12oz, matte glaze — or paste a link to a product you want to recreate"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Estimated quantity or budget (optional)</Label>
        <Input
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 500 units, or $2,000 budget"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anything else? (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Target price, materials, certifications, shipping destination…"
          rows={3}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm font-medium text-destructive">
          Something went wrong. Please email us directly at contact@craftly.world.
        </p>
      )}
      {status === 'sent' && (
        <p className="text-sm font-medium text-emerald-400">
          Thanks — your request is on its way. We&apos;ll get back to you within 24 hours.
        </p>
      )}

      <Button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto">
        {status === 'sending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Get a quote'
        )}
      </Button>
    </form>
  )
}
