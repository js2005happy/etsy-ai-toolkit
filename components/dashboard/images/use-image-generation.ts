'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ProductImageInput, ProductImageOutput } from '@/lib/openai'
import { useI18n } from '@/lib/i18n/client'

export type { ProductImageInput, ProductImageOutput }

export function useImageGeneration() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ProductImageOutput[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creditError, setCreditError] = useState(false)
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
      setCreditError(false)
      setImages([])
      try {
        const response = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })

        if (response.status === 401) {
          setError(t('dashboardTools.common.logIn'))
          return []
        }
        if (response.status === 403) {
          setCreditError(true)
          setError(t('dashboardTools.common.insufficientCredits'))
          return []
        }
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || t('dashboardTools.common.somethingWrong'))
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
    [refreshCredits, t]
  )

  return { loading, images, error, creditError, credits, generate }
}
