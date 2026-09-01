'use client'

import { useEffect } from 'react'

// Global behaviours from the static site.js that need document-level listeners:
// card-glow follows the cursor across bento cells + tool cards.
export default function SiteEffects() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const el = target?.closest?.('.k-cell, .k-tool-card') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])
  return null
}
