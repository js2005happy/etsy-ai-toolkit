'use client'

import { useEffect, useRef } from 'react'

export default function Parallax({
  speed = 0.2,
  className = '',
  children,
}: {
  speed?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0

    const update = () => {
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight
      const centerOffset = rect.top + rect.height / 2 - viewportH / 2
      el.style.transform = `translate3d(0, ${centerOffset * -speed}px, 0)`
      raf = 0
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  )
}
