'use client'

import { useEffect, useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WishlistButton({ storefrontId, productId, compact = false }: { storefrontId: string; productId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/marketplace/wishlist?product_id=${encodeURIComponent(productId)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) return { signedIn: false, saved: false }
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Unable to load wishlist status')
        return { signedIn: true, saved: Boolean(data.saved) }
      })
      .then((state) => {
        if (cancelled) return
        setSignedIn(state.signedIn)
        setSaved(state.saved)
      })
      .catch(() => { if (!cancelled) setSignedIn(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [productId])

  const toggle = async () => {
    if (signedIn === false) {
      const next = `${window.location.pathname}${window.location.search}`
      window.location.assign(`/login?next=${encodeURIComponent(next)}`)
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/marketplace/wishlist', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved ? { product_id: productId } : { storefront_id: storefrontId, product_id: productId }),
      })
      if (res.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`
        window.location.assign(`/login?next=${encodeURIComponent(next)}`)
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Unable to update wishlist')
      setSignedIn(true)
      setSaved(Boolean(data.saved))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant={saved ? 'default' : 'outline'} size={compact ? 'sm' : 'default'} onClick={toggle} disabled={loading || busy} aria-pressed={saved}>
      {loading || busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} />}
      {saved ? 'Saved' : 'Save'}
    </Button>
  )
}
