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

const MAX_ROTATE = 8

export default function TiltCard({ href, icon, title, description }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const apply = (
    rotateX: number,
    rotateY: number,
    glowX: number,
    glowY: number,
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
    card.style.setProperty('--glow-x', `${glowX}%`)
    card.style.setProperty('--glow-y', `${glowY}%`)
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
        (x + 0.5) * 100,
        (y + 0.5) * 100,
        x * -14,
        y * -14,
        x * 10,
        y * 10,
        1.02
      )
    })
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    cancelAnimationFrame(rafRef.current)
    card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    apply(0, 0, 50, 50, 0, 0, 0, 0, 1)
  }

  const vars = {
    '--rotateX': '0deg',
    '--rotateY': '0deg',
    '--glow-x': '50%',
    '--glow-y': '50%',
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
        className="relative flex h-full flex-col rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl will-change-transform"
      >
        {/* 高光跟随 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div
            className="absolute h-[320px] w-[320px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              left: 'var(--glow-x)',
              top: 'var(--glow-y)',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(255,138,82,0.10) 0%, rgba(255,138,82,0) 70%)',
            }}
          />
        </div>

        {/* 图标层（浮起） */}
        <div
          className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white transition-transform duration-100 ease-out"
          style={{ transform: 'translate3d(var(--icon-x), var(--icon-y), 24px)' }}
        >
          {icon}
        </div>

        {/* 文字层 */}
        <div
          className="transition-transform duration-100 ease-out"
          style={{ transform: 'translate3d(var(--text-x), var(--text-y), 8px)' }}
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm font-normal leading-relaxed text-white/60">{description}</p>
        </div>

        {/* Open Tool */}
        <div className="mt-auto pt-8">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#ff8a52] transition-colors duration-300 group-hover:bg-[#ff8a52]/10">
            Open Tool
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
