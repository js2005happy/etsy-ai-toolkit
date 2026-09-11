'use client'

import { useEffect } from 'react'

export type RecentlyViewedItem = {
  productId: string
  storefrontSlug: string
  storefrontName: string
  title: string
  image: string | null
  price: number | null
  currency: string
  viewedAt: string
}

const KEY = 'craftly.marketplace.recently-viewed.v1'
const LIMIT = 12

export function readRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.productId === 'string').slice(0, LIMIT) : []
  } catch {
    return []
  }
}

export function clearRecentlyViewed() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(KEY)
}

export default function RecentlyViewedTracker({ item }: { item: Omit<RecentlyViewedItem, 'viewedAt'> }) {
  useEffect(() => {
    const next: RecentlyViewedItem = { ...item, viewedAt: new Date().toISOString() }
    const current = readRecentlyViewed().filter((entry) => entry.productId !== item.productId)
    try {
      window.localStorage.setItem(KEY, JSON.stringify([next, ...current].slice(0, LIMIT)))
    } catch {
      // Browsing history is optional and local-only; storage failures must not block product viewing.
    }
  }, [item])

  return null
}
