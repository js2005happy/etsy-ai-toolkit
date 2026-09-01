'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function Reveal({
  children,
  className = '',
  delay = 0,
  href,
  style,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  href?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setVisible(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cls = `k-reveal${visible ? ' in' : ''}${className ? ' ' + className : ''}`
  const mergedStyle: React.CSSProperties = { ...style, transitionDelay: `${delay}ms` }

  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        style={mergedStyle}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cls}
      style={mergedStyle}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
