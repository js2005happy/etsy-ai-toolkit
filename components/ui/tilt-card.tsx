'use client'

import Link from 'next/link'
import { useRef } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type TiltCardProps = {
  href: string
  icon: ReactNode
  title: string
  description: string
}

const MAX_ROTATE = 4

export default function TiltCard({ href, icon, title, description }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const apply = (
    rotateX: number,
    rotateY: number,
    iconX: number,
    iconY: number,
    textX: number,
    textY: number,
    scale: number
  ) => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rotateX', `${rotateX}deg`)
    card.style.setProperty('--rotateY', `${rotateY}deg`)
    card.style.setProperty('--icon-x', `${iconX}px`)
    card.style.setProperty('--icon-y', `${iconY}px`)
    card.style.setProperty('--text-x', `${textX}px`)
    card.style.setProperty('--text-y', `${textY}px`)
    card.style.setProperty('--scale', `${scale}`)
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      card.style.transition = 'transform 0.1s ease-out'
      apply(
        -y * MAX_ROTATE,
        x * MAX_ROTATE,
        x * -10,
        y * -10,
        x * 8,
        y * 8,
        1.01
      )
    })
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    cancelAnimationFrame(rafRef.current)
    card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    apply(0, 0, 0, 0, 0, 0, 1)
  }

  const vars = {
    '--rotateX': '0deg',
    '--rotateY': '0deg',
    '--icon-x': '0px',
    '--icon-y': '0px',
    '--text-x': '0px',
    '--text-y': '0px',
    '--scale': '1',
  } as CSSProperties

  return (
    <Link href={href} className="group block h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ...vars,
          transform:
            'perspective(1000px) rotateX(var(--rotateX)) rotateY(var(--rotateY)) scale(var(--scale))',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="relative flex h-full flex-col rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/30"
      >
        {/* 图标层（浮起） */}
        <div
          className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground transition-transform duration-100 ease-out"
          style={{ transform: 'translate3d(var(--icon-x), var(--icon-y), 24px)' }}
        >
          {icon}
        </div>

        {/* 文字层 */}
        <div
          className="transition-transform duration-100 ease-out"
          style={{ transform: 'translate3d(var(--text-x), var(--text-y), 8px)' }}
        >
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">{description}</p>
        </div>

        {/* Open Tool */}
        <div className="mt-auto pt-8">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors duration-300 group-hover:bg-primary/10">
            Open Tool
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
