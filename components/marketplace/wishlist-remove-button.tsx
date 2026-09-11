'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeartOff, Loader2 } from 'lucide-react'

export default function WishlistRemoveButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const remove = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/marketplace/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={remove} disabled={loading} className="inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50">
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <HeartOff className="mr-1.5 h-3.5 w-3.5" />}
      Remove
    </button>
  )
}
