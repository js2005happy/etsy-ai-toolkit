'use client'

import { useEffect, useRef, useState } from 'react'

function format(v: number, suffix: string) {
  return (v >= 1000 ? v.toLocaleString() : String(v)) + suffix
}

export default function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null)
  const [display, setDisplay] = useState(() => format(target, suffix))
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || started.current) return
          started.current = true
          const dur = 1400
          let start: number | null = null
          const tick = (ts: number) => {
            if (start === null) start = ts
            const p = Math.min((ts - start) / dur, 1)
            const v = Math.round(target * (1 - Math.pow(1 - p, 3)))
            setDisplay(format(v, suffix))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.disconnect()
        })
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, suffix])

  return <b ref={ref}>{display}</b>
}
