'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const spotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const spot = spotRef.current
    if (!spot) return
    const onMove = (e: PointerEvent) => {
      spot.style.setProperty('--x', `${e.clientX}px`)
      spot.style.setProperty('--y', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* E · Kinetic ambient orbs — amber / rose / mint */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      {/* cursor-follow spotlight */}
      <div ref={spotRef} className="spotlight" />

      {/* film grain (kept faint for clarity) */}
      <div className="film-grain absolute inset-0 opacity-[0.045] mix-blend-overlay" />
    </div>
  )
}
