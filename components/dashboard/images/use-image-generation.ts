'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ProductImageInput, ProductImageOutput } from '@/lib/openai'

export type { ProductImageInput, ProductImageOutput }

export function useImageGeneration() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ProductImageOutput[]>([])
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)

  const refreshCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data.imageCredits)
      }
    } catch (e) {
      console.error('Failed to fetch credits', e)
    }
  }, [])

  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  const generate = useCallback(
    async (items: ProductImageInput[]): Promise<ProductImageOutput[]> => {
      setLoading(true)
      setError(null)
      setImages([])
      try {
        const response = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })

        if (response.status === 401) {
          setError('Please log in to use this tool.')
          return []
        }
        if (response.status === 403) {
          const data = await response.json().catch(() => null)
          setError(
            data?.error ||
              'Insufficient image credits. Please upgrade your plan to generate more images.'
          )
          return []
        }
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Something went wrong')
        }

        const data = await response.json()
        const imgs: ProductImageOutput[] = data.images ?? []
        setImages(imgs)
        await refreshCredits()
        return imgs
      } catch (err: any) {
        setError(err.message)
        return []
      } finally {
        setLoading(false)
      }
    },
    [refreshCredits]
  )

  return { loading, images, error, credits, generate }
}
