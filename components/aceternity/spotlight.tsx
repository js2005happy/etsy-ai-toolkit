'use client'

import { useMotionValue, motion, useMotionTemplate } from 'framer-motion'
import type { MouseEvent, ReactNode } from 'react'

type SpotlightProps = {
  children: ReactNode
  className?: string
  radius?: number
  color?: string
  active?: boolean
}

export default function Spotlight({
  children,
  className = '',
  radius = 500,
  color = 'hsl(var(--primary) / 0.13)',
  active = false,
}: SpotlightProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <div
      className={`group/spotlight relative ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${
          active
            ? 'opacity-100'
            : 'opacity-0 group-hover/spotlight:opacity-100'
        }`}
        style={{
          background: useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
