'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

export const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]
  return (
    <span className={`${cls} font-extrabold tracking-tight`}>
      <span className="text-accent">N</span>IVEL
    </span>
  )
}

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const offsets = { up: [30, 0], down: [-30, 0], left: [0, -40], right: [0, 40] }
  const [y, x] = offsets[direction]
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

