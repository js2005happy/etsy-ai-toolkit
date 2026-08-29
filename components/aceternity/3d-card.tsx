'use client'

import { createContext, useContext, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const CardHoverContext = createContext(false)

export function useCardHover() {
  return useContext(CardHoverContext)
}

export function CardContainer({
  children,
  className = '',
  containerClassName = '',
}: {
  children: ReactNode
  className?: string
  containerClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <CardHoverContext.Provider value={isHovered}>
      <div
        ref={ref}
        className={cn('relative', containerClassName)}
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className={cn('relative h-full w-full', className)}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          {children}
        </motion.div>
      </div>
    </CardHoverContext.Provider>
  )
}

export function CardItem({
  children,
  className = '',
  translateZ = 0,
}: {
  children: ReactNode
  className?: string
  translateZ?: number | MotionValue<number>
}) {
  return (
    <motion.div
      className={cn('', className)}
      style={{ translateZ, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}
