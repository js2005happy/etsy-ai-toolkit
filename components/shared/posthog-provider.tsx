'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!PH_KEY) return
    posthog.init(PH_KEY, {
      api_host: PH_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
    })
  }, [])

  useEffect(() => {
    if (PH_KEY && pathname) {
      posthog.capture('$pageview')
    }
  }, [pathname])

  return <>{children}</>
}
