'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react'

const MotionLink = motion(Link)

type MagneticButtonProps = {
  children: ReactNode
  className?: string
  strength?: number
  href?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  'aria-label'?: string
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  href,
  onClick,
  type,
  disabled,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: ReactMouseEvent) {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    setPos({
      x: (e.clientX - (left + width / 2)) * strength,
      y: (e.clientY - (top + height / 2)) * strength,
    })
  }

  const shared = {
    ref: ref as React.Ref<any>,
    animate: { x: pos.x, y: pos.y },
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 18,
      mass: 0.2,
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: () => setPos({ x: 0, y: 0 }),
    className,
  }

  if (href) {
    return (
      <MotionLink href={href} {...shared}>
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button {...shared} onClick={onClick} type={type} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </motion.button>
  )
}
