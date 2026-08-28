'use client'

import { useEffect, useRef, useState } from 'react'

export default function BlurText({
  text,
  className = '',
  delay = 100,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block will-change-transform"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : 'blur(10px)',
            transform: visible ? 'translateY(0)' : 'translateY(50px)',
            transition:
              'opacity 0.35s ease, filter 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {word}
          {' '}
        </span>
      ))}
    </span>
  )
}
