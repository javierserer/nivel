'use client'

import { motion, useInView, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { useRef, useState, useEffect, type ReactNode } from 'react'

/* ================================================================
   ANIMATION PRIMITIVES
   ================================================================ */

const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }
const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 200, damping: 22 }

function FadeIn({
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

function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 })

  useEffect(() => {
    if (inView) motionVal.set(target)
  }, [inView, target, motionVal])

  useEffect(() => {
    const unsub = springVal.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(v).toLocaleString('es-ES')}${suffix}`
    })
    return unsub
  }, [springVal, prefix, suffix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

/* ================================================================
   PHONE FRAME
   ================================================================ */

function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-[280px] h-[560px] bg-[#1c1c1e] rounded-[3rem] p-[6px] shadow-2xl shadow-black/50 border border-white/[0.08] ${className}`}>
      <div className="w-full h-full bg-[#0c0c0c] rounded-[2.6rem] overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-[#1c1c1e] rounded-b-2xl z-10" />
        {children}
      </div>
    </div>
  )
}

/* ================================================================
   COIN ICON
   ================================================================ */

function Coin({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 font-bold text-black shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      D
    </span>
  )
}

/* ================================================================
   NAVBAR
   ================================================================ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <span className="text-lg font-extrabold tracking-tighter">
          <span className="text-gold">D</span>OSIS
        </span>
        <div className="flex items-center gap-6">
          <a href="#como-funciona" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition">
            Cómo funciona
          </a>
          <a href="#squads" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition">
            Squads
          </a>
          <a
            href="#waitlist"
            className="px-4 py-2 text-sm font-semibold rounded-full bg-gold text-black hover:bg-gold-light transition"
          >
            ¿Tienes invitación?
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ================================================================
   HERO
   ================================================================ */

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const habits = [
    { name: 'Gym 1h', coins: 80, done: true },
    { name: 'Leer 30min', coins: 40, done: true },
    { name: 'Sin alcohol', coins: 25, done: true },
    { name: 'Meditar 10min', coins: 20, done: false },
  ]

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-gold/[0.07] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-vice/[0.05] blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-neutral-400 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.1 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            La app que no sabías que necesitabas
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            GÁNATE
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              TUS VICIOS.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.35 }}
          >
            Gana puntos por ser disciplinado.
            <br className="hidden sm:block" />{' '}
            Gástalos en vicios reales.
            <br className="hidden sm:block" />{' '}
            <span className="text-white font-medium">Solo entras si alguien cree que te lo mereces.</span>
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.5 }}
          >
            <a
              href="/access"
              className="px-8 py-3.5 rounded-full bg-gold text-black font-bold text-base hover:bg-gold-light transition hover:scale-105 active:scale-95 text-center"
            >
              Tengo una invitación →
            </a>
            <a
              href="#como-funciona"
              className="px-6 py-3.5 rounded-full border border-white/15 text-white font-semibold text-base hover:bg-white/5 transition text-center"
            >
              Cómo funciona
            </a>
          </motion.div>

          <motion.div
            className="mt-8 flex items-center gap-3 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex -space-x-2">
              {['🧔', '👩', '🧑‍🦱', '👨‍🦰', '👩‍🦳'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center text-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              <span className="text-white font-semibold">4.847</span> dentro · <span className="text-gold font-medium">Solo por invitación</span>
            </p>
          </motion.div>
        </div>

        {/* Phone mockup */}
        <motion.div
          className="relative shrink-0"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ ...SPRING, delay: 0.3 }}
        >
          <PhoneFrame>
            <div className="pt-10 px-4 pb-4 h-full flex flex-col">
              {/* App header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold tracking-tighter text-white">
                  <span className="text-gold">D</span>OSIS
                </span>
                <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold">
                  🔥 <span>14 días</span>
                </div>
              </div>

              {/* Balance card */}
              <motion.div
                className="bg-gradient-to-br from-amber-500/20 via-yellow-600/10 to-transparent rounded-2xl p-4 border border-amber-500/20 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...SPRING_SNAPPY, delay: 0.7 }}
              >
                <p className="text-[10px] text-amber-300/70 font-medium uppercase tracking-wider">Tu saldo</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white">850</span>
                  <Coin size={18} />
                </div>
                <p className="text-[10px] text-emerald-400 mt-1">+145 hoy</p>
              </motion.div>

              {/* Habits */}
              <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">Hoy</p>
              <div className="space-y-2 flex-1">
                {habits.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between bg-white/[0.04] rounded-xl px-3 py-2.5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ ...SPRING, delay: 0.8 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                          h.done
                            ? 'bg-emerald-500 text-white'
                            : 'border border-neutral-600'
                        }`}
                      >
                        {h.done && '✓'}
                      </div>
                      <span className={`text-xs ${h.done ? 'text-neutral-300' : 'text-neutral-500'}`}>{h.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      +{h.coins} <Coin size={10} />
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-3 mb-2">
                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                  <span>Progreso</span>
                  <span>3/4</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '75%' } : {}}
                    transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </PhoneFrame>

          {/* Floating badge */}
          <motion.div
            className="absolute -right-6 top-28 bg-card border border-border rounded-xl p-3 shadow-2xl shadow-black/50 w-44"
            initial={{ opacity: 0, x: 20, scale: 0.85 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ ...SPRING, delay: 1.4 }}
          >
            <motion.div
              animate={inView ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            >
              <p className="text-[10px] text-emerald-400 font-semibold mb-1">🍺 Desbloqueado</p>
              <p className="text-xs text-neutral-300">Te has ganado una cerveza</p>
              <p className="text-[10px] text-neutral-600 mt-1">Hace 2 min</p>
            </motion.div>
          </motion.div>

          {/* Streak badge */}
          <motion.div
            className="absolute -left-4 bottom-28 bg-card border border-border rounded-xl p-3 shadow-2xl shadow-black/50"
            initial={{ opacity: 0, x: -20, scale: 0.85 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ ...SPRING, delay: 1.6 }}
          >
            <motion.div
              animate={inView ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            >
              <p className="text-[10px] text-orange-400 font-semibold">🔥 Racha x2</p>
              <p className="text-xs text-neutral-300 mt-0.5">14 días · Doble puntos</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================
   HOW IT WORKS
   ================================================================ */

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'CURRA',
      emoji: '🏋️',
      desc: 'Define tus hábitos. Cada uno vale monedas. Tú decides el precio de tu disciplina.',
      color: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
    },
    {
      number: '02',
      title: 'GANA',
      emoji: '🪙',
      desc: 'Cumple y acumula. Las rachas multiplican. 7 días seguidos = puntos dobles.',
      color: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/20',
    },
    {
      number: '03',
      title: 'GÁSTALO',
      emoji: '🍺',
      desc: '¿Cerveza? ¿Netflix? ¿Cheat meal? Si tienes saldo, el vicio es tuyo. Si no, te jodes.',
      color: 'from-vice/20 to-vice/5',
      border: 'border-vice/20',
    },
  ]

  return (
    <section id="como-funciona" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-16">
          <p className="text-sm text-gold font-semibold uppercase tracking-widest mb-3">Así funciona</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Tres pasos. Sin excusas.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.15}>
              <motion.div
                className={`relative bg-gradient-to-b ${s.color} rounded-2xl p-6 border ${s.border} h-full group`}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              >
                <span className="text-5xl mb-4 block">{s.emoji}</span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs text-neutral-600 font-mono">{s.number}</span>
                  <h3 className="text-xl font-extrabold tracking-tight">{s.title}</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   VICE ECONOMY
   ================================================================ */

function ViceEconomy() {
  const earnings = [
    { name: 'Gym 1h', coins: 80, emoji: '🏋️' },
    { name: 'Leer 30min', coins: 40, emoji: '📖' },
    { name: 'Madrugar antes de las 7', coins: 30, emoji: '⏰' },
    { name: 'Sin alcohol hoy', coins: 25, emoji: '🚫' },
    { name: 'Meditar 10min', coins: 20, emoji: '🧘' },
    { name: 'Beber 2L agua', coins: 15, emoji: '💧' },
  ]

  const expenses = [
    { name: 'Cheat meal', coins: 150, emoji: '🍕' },
    { name: 'Cerveza', coins: 100, emoji: '🍺' },
    { name: 'Netflix binge', coins: 80, emoji: '📺' },
    { name: 'Saltarte el gym', coins: 60, emoji: '🛋️' },
    { name: 'Dormir la mona', coins: 40, emoji: '😴' },
    { name: 'Fast food', coins: 120, emoji: '🍔' },
  ]

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-5 relative">
        <FadeIn className="text-center mb-16">
          <p className="text-sm text-gold font-semibold uppercase tracking-widest mb-3">La economía del vicio</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Cada hábito tiene precio.
            <br />
            <span className="text-neutral-500">Cada vicio también.</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm">
                  ↑
                </div>
                <h3 className="font-bold text-lg">Ganas</h3>
              </div>
              <div className="space-y-3">
                {earnings.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between group"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm text-neutral-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      +{item.coins} <Coin size={12} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Expenses */}
          <FadeIn delay={0.25}>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-vice/10 flex items-center justify-center text-vice text-sm">
                  ↓
                </div>
                <h3 className="font-bold text-lg">Gastas</h3>
              </div>
              <div className="space-y-3">
                {expenses.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between group"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm text-neutral-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-vice flex items-center gap-1.5">
                      -{item.coins} <Coin size={12} />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4} className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-card rounded-full border border-border px-5 py-3">
            <span className="text-sm text-neutral-400">La matemática es simple:</span>
            <span className="text-sm font-bold">
              <span className="text-emerald-400">3 gym</span>
              {' = '}
              <span className="text-vice">1 cerveza + 1 cheat meal</span>
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ================================================================
   SQUADS
   ================================================================ */

function Squads() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const ranking = [
    { pos: 1, name: 'Carlos', coins: 1240, emoji: '🥇', you: false },
    { pos: 2, name: 'María', coins: 980, emoji: '🥈', you: false },
    { pos: 3, name: 'Tú', coins: 850, emoji: '🥉', you: true },
    { pos: 4, name: 'David', coins: 320, emoji: '💀', you: false, last: true },
  ]

  return (
    <section id="squads" className="py-24 sm:py-32 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Mockup */}
          <motion.div
            className="relative shrink-0 order-2 lg:order-1"
            initial={{ opacity: 0, scale: 0.9, x: -40 }}
            animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            <PhoneFrame>
              <div className="pt-10 px-4 pb-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-neutral-500 font-semibold">SQUAD</p>
                  <div className="flex -space-x-1.5">
                    {['🧔', '👩', '🧑', '👨'].map((e, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-card border border-[#0c0c0c] text-[8px] flex items-center justify-center">
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-4">Los Disciplinados</h3>

                {/* Ranking */}
                <div className="space-y-2 flex-1">
                  {ranking.map((r, i) => (
                    <motion.div
                      key={i}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                        r.you
                          ? 'bg-gold/10 border border-gold/20'
                          : r.last
                          ? 'bg-red-500/5 border border-red-500/10'
                          : 'bg-white/[0.03]'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ ...SPRING, delay: 0.5 + i * 0.12 }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{r.emoji}</span>
                        <div>
                          <p className={`text-xs font-semibold ${r.you ? 'text-gold' : 'text-white'}`}>
                            {r.name}
                          </p>
                          {r.last && (
                            <p className="text-[9px] text-red-400">Paga las cañas 🍻</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                        {r.coins.toLocaleString()} <Coin size={10} />
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Shame notification */}
                <motion.div
                  className="mt-4 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ ...SPRING, delay: 1.1 }}
                >
                  <p className="text-[10px] text-red-400 font-semibold mb-0.5">📢 Vergüenza pública</p>
                  <p className="text-[11px] text-neutral-300">David no ha ido al gym hoy 👀</p>
                </motion.div>

                {/* Challenge */}
                <motion.div
                  className="mt-2 bg-gradient-to-r from-vice/10 to-transparent rounded-xl p-3 border border-vice/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ ...SPRING, delay: 1.25 }}
                >
                  <p className="text-[10px] text-vice font-semibold mb-0.5">⚔️ Reto semanal</p>
                  <p className="text-[11px] text-neutral-300">5 gyms esta semana · 2/5 completados</p>
                </motion.div>
              </div>
            </PhoneFrame>

            {/* Floating duel badge */}
            <motion.div
              className="absolute -right-4 top-20 bg-card border border-border rounded-xl p-3 shadow-2xl shadow-black/50 w-40"
              initial={{ opacity: 0, x: 20, scale: 0.85 }}
              animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ ...SPRING, delay: 1.4 }}
            >
              <motion.div
                animate={inView ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              >
                <p className="text-[10px] text-vice font-semibold">⚔️ Nuevo duelo</p>
                <p className="text-[11px] text-neutral-300 mt-0.5">Carlos te reta:</p>
                <p className="text-[10px] text-white font-medium mt-0.5">&quot;¿Quién lee más esta semana?&quot;</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <div className="flex-1 text-center lg:text-left order-1 lg:order-2">
            <FadeIn>
              <p className="text-sm text-gold font-semibold uppercase tracking-widest mb-3">Squads</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Tus amigos son
                <br />
                tu mejor excusa.
                <br />
                <span className="text-neutral-500">Y tu peor pesadilla.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Crea un Squad. Compite cada semana. El último paga las cañas.
                Y si no vas al gym, <span className="text-white font-medium">todo el mundo se entera.</span>
              </p>
            </FadeIn>

            <div className="mt-8 space-y-4 max-w-md mx-auto lg:mx-0">
              {[
                { icon: '🏆', text: 'Ranking semanal entre amigos', detail: 'El primero elige castigo del último' },
                { icon: '👀', text: 'Vergüenza pública', detail: 'Si no cumples, tu squad lo sabe' },
                { icon: '⚔️', text: 'Duelos 1v1', detail: 'Reta a cualquiera. El perdedor paga.' },
                { icon: '🔒', text: 'Sin amigos no hay juego', detail: 'Invita o pierde funciones' },
              ].map((f, i) => (
                <FadeIn key={i} delay={0.3 + i * 0.1}>
                  <div className="flex items-start gap-3 text-left">
                    <span className="text-lg mt-0.5">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.text}</p>
                      <p className="text-xs text-neutral-500">{f.detail}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   WEEKLY RECAP
   ================================================================ */

function WeeklyRecap() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 sm:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vice/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-5 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <FadeIn>
              <p className="text-sm text-vice font-semibold uppercase tracking-widest mb-3">Weekly Recap</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Tu semana
                <br />
                en una story.
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Cada lunes generas tu recap. Tan bonito que querrás presumir.
                <span className="text-white font-medium"> Tan sincero que no podrás mentir.</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 space-y-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: '📱', text: 'Formato Instagram Story', detail: 'Listo para compartir en un tap' },
                  { icon: '📊', text: 'Tus stats reales', detail: 'No puedes fingir los números' },
                  { icon: '🔗', text: 'Link + QR incluidos', detail: 'Cada share es un usuario nuevo' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <span className="text-lg mt-0.5">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{f.text}</p>
                      <p className="text-xs text-neutral-500">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Recap card mockup (story format) */}
          <motion.div
            className="relative shrink-0"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            <div className="w-[260px] bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-3xl p-5 border border-white/[0.08] shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="text-center mb-5">
                <p className="text-[10px] text-neutral-600 font-mono">DOSIS · WEEKLY RECAP</p>
                <motion.p
                  className="text-lg font-extrabold text-white mt-1"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  SEMANA 14
                </motion.p>
                <motion.div
                  className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-2.5 py-0.5 mt-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ ...SPRING_SNAPPY, delay: 0.6 }}
                >
                  <span className="text-[10px] text-gold font-bold">LVL 23 ⭐</span>
                </motion.div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Gym', value: '5/5', color: 'text-emerald-400' },
                  { label: 'Lectura', value: '4/7', color: 'text-blue-400' },
                  { label: 'Sin alcohol', value: '6/7', color: 'text-amber-400' },
                  { label: 'Meditación', value: '3/5', color: 'text-vice' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/[0.04] rounded-lg p-2 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ ...SPRING, delay: 0.7 + i * 0.1 }}
                  >
                    <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-neutral-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] my-4" />

              {/* Earned vices */}
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.1 }}
              >
                <p className="text-[10px] text-neutral-500 font-semibold mb-2">ME HE GANADO</p>
                <div className="flex justify-center gap-2 text-2xl">
                  {['🍺', '🍺', '🍕', '📺'].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ ...SPRING_SNAPPY, delay: 1.2 + i * 0.1 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Balance */}
              <motion.div
                className="text-center bg-gradient-to-r from-gold/10 to-transparent rounded-lg p-2.5 mb-4"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.4 }}
              >
                <p className="text-[10px] text-neutral-500">BALANCE SEMANAL</p>
                <p className="text-lg font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
                  +420 <Coin size={14} />
                </p>
              </motion.div>

              {/* QR placeholder */}
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 }}
              >
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-[2px]">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-[1px] ${
                          [0, 1, 3, 4, 5, 7, 8, 11, 12, 13, 15].includes(i)
                            ? 'bg-black'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <p className="text-center text-[8px] text-neutral-600 mt-2 font-mono">dosis.app</p>
            </div>

            {/* Glow behind */}
            <div className="absolute -inset-8 bg-gradient-radial from-vice/[0.08] to-transparent rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   SOCIAL PROOF / SHAME BELT
   ================================================================ */

function ShameBelt() {
  const notifications = [
    '🏋️ Carlos completó su 5to gym de la semana',
    '👀 David lleva 3 días sin entrenar...',
    '🍺 María se ha ganado una cerveza',
    '⚔️ Nuevo duelo: Laura vs Pablo · Running semanal',
    '🔥 Ana lleva 30 días de racha · Multiplicador x4',
    '💀 Grupo "Los Disciplinados": David último otra vez',
    '📱 12 personas se unieron esta semana desde recaps',
    '🥇 Tu squad "Gym Bros" es top 5% global',
  ]

  return (
    <section className="py-16 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      <FadeIn className="text-center mb-8">
        <p className="text-sm text-neutral-500">Esto está pasando ahora mismo 👇</p>
      </FadeIn>
      <div className="relative">
        <motion.div
          className="flex gap-4 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...notifications, ...notifications].map((n, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm text-neutral-300 shrink-0"
            >
              {n}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================
   INVITE SYSTEM
   ================================================================ */

function InviteSystem() {
  const tiers = [
    { count: '500', label: 'Founding Members', invites: 10, badge: '🏅', desc: 'Badge permanente dorado + 10 invitaciones', color: 'from-gold/20 to-gold/5', border: 'border-gold/30' },
    { count: '2.500', label: 'Nivel 2', invites: 5, badge: '🎫', desc: '5 invitaciones + gana más siendo disciplinado', color: 'from-white/5 to-transparent', border: 'border-border' },
    { count: '12.500', label: 'Nivel 3', invites: 5, badge: '🌱', desc: 'Y así sucesivamente. Sin límite.', color: 'from-white/5 to-transparent', border: 'border-border' },
  ]

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vice/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-5 relative">
        <FadeIn className="text-center mb-16">
          <p className="text-sm text-vice font-semibold uppercase tracking-widest mb-3">El sistema</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Cada invitación es un privilegio.
            <br />
            <span className="text-neutral-500">No un enlace genérico.</span>
          </h2>
        </FadeIn>

        {/* Growth visualization */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
            {tiers.map((tier, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.15} className="relative">
                <div className={`bg-gradient-to-b ${tier.color} border ${tier.border} rounded-2xl p-4 text-center w-36 sm:w-44`}>
                  <span className="text-2xl mb-1 block">{tier.badge}</span>
                  <p className="text-xl font-extrabold text-white">{tier.count}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">{tier.label}</p>
                  <p className="text-[10px] text-neutral-500 mt-1.5 leading-relaxed">{tier.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Earn more invites */}
        <FadeIn delay={0.4}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-white mb-4 text-center">Gana más invitaciones</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { action: 'Racha de 30 días', reward: '+2 invitaciones', emoji: '🔥' },
                { action: 'Ganar 3 duelos', reward: '+1 invitación', emoji: '⚔️' },
                { action: 'Squad en top 10%', reward: '+1 para todos', emoji: '🏆' },
              ].map((item, i) => (
                <div key={i} className="text-center bg-white/[0.02] rounded-xl p-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="text-xs text-white font-medium mt-1.5">{item.action}</p>
                  <p className="text-[10px] text-gold font-bold mt-0.5">{item.reward}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Invite tree teaser */}
        <FadeIn delay={0.55} className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-card rounded-full border border-border px-5 py-3">
            <span className="text-sm">🌳</span>
            <span className="text-sm text-neutral-400">
              Tu <span className="text-white font-semibold">árbol de invitaciones</span> crece con cada persona que metes.
              El founding member con el árbol más grande gana.
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ================================================================
   WHY IT WORKS
   ================================================================ */

function WhyItWorks() {
  const reasons = [
    {
      title: 'La vergüenza funciona mejor que la motivación',
      desc: 'Puedes ignorar una notificación. No puedes ignorar a tu squad viéndote fallar.',
      icon: '👀',
    },
    {
      title: 'Los vicios son la zanahoria perfecta',
      desc: 'No te levantas a las 6 por "salud". Te levantas porque quieres esa cerveza el viernes.',
      icon: '🍺',
    },
    {
      title: 'La competición es adictiva',
      desc: 'Ver a Carlos por encima tuyo en el ranking duele. Y eso te mueve el culo.',
      icon: '🏆',
    },
    {
      title: '5 invitaciones. Ni una más.',
      desc: 'No puedes entrar si nadie te invita. Y cada persona solo tiene 5. Eso convierte cada invitación en oro.',
      icon: '🔒',
    },
  ]

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Por qué funciona
            <br />
            <span className="text-neutral-500">(cuando todo lo demás falla)</span>
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.1}>
              <motion.div
                className="bg-card rounded-2xl border border-border p-6 h-full"
                whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              >
                <span className="text-3xl mb-3 block">{r.icon}</span>
                <h3 className="text-base font-bold text-white mb-2">{r.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{r.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   NUMBERS
   ================================================================ */

function Numbers() {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: 4847, label: 'Personas dentro', suffix: '' },
            { value: 5, label: 'Invitaciones por persona', suffix: '' },
            { value: 87, label: 'Usan 3+ de sus 5 invites', suffix: '%' },
            { value: 3, label: 'Niveles de profundidad media', suffix: '.4' },
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   INVITE CTA
   ================================================================ */

function InviteCTA() {
  return (
    <section id="waitlist" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 text-center relative">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/[0.05] text-xs text-gold font-semibold mb-6">
            🔒 Solo por invitación
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            NO PUEDES ENTRAR.
          </h2>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mt-2">
            <span className="text-neutral-500">A no ser que alguien crea</span>
          </h2>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mt-2">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              que te lo mereces.
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mt-8 text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Cada persona dentro tiene <span className="text-white font-semibold">5 invitaciones</span>. Solo 5.
            <br />
            Elige bien a quién metes. No hay segunda oportunidad.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <a
            href="/access"
            className="inline-block mt-10 px-10 py-4 rounded-xl bg-gold text-black font-bold text-lg hover:bg-gold-light transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Tengo una invitación →
          </a>
          <p className="mt-4 text-sm text-neutral-600">
            ¿No tienes? Consigue que alguien te invite.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ================================================================
   FOOTER
   ================================================================ */

function Footer() {
  return (
    <footer className="py-12 border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-extrabold tracking-tighter">
              <span className="text-gold">D</span>OSIS
            </span>
            <span className="text-xs text-neutral-600">Solo por invitación.</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { name: 'Twitter', icon: '𝕏' },
              { name: 'Instagram', icon: '📷' },
              { name: 'TikTok', icon: '🎵' },
            ].map((s) => (
              <a
                key={s.name}
                href="#"
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-sm hover:bg-white/10 transition"
                aria-label={s.name}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] text-neutral-700 mt-8">
          © 2026 DOSIS. Todos los derechos reservados. · La disciplina es el nuevo lujo.
        </p>
      </div>
    </footer>
  )
}

/* ================================================================
   PAGE
   ================================================================ */

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <ViceEconomy />
      <ShameBelt />
      <Squads />
      <WeeklyRecap />
      <InviteSystem />
      <WhyItWorks />
      <Numbers />
      <InviteCTA />
      <Footer />
    </main>
  )
}
