'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { FadeIn, Logo, SPRING } from '@/components/shared'
import { WeeklyShareCard } from '@/components/charts'
import {
  Flame, Heart, Target, BarChart3, Trophy,
  Check, ArrowRight, Zap, Swords,
} from 'lucide-react'

/* ================================================================
   PHONE FRAME
   ================================================================ */

function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-[280px] h-[560px] bg-gray-900 rounded-[3rem] p-[6px] shadow-2xl shadow-gray-300/40 border border-gray-200 ${className}`}>
      <div className="w-full h-full bg-white rounded-[2.6rem] overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-gray-900 rounded-b-2xl z-10" />
        {children}
      </div>
    </div>
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
        scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <Logo size="sm" />
        <div className="flex items-center gap-6">
          <a href="#como-funciona" className="hidden sm:block text-sm text-muted hover:text-foreground transition">
            Cómo funciona
          </a>
          <a href="#squads" className="hidden sm:block text-sm text-muted hover:text-foreground transition">
            Squads
          </a>
          <a
            href="#join"
            className="px-4 py-2 text-sm font-semibold rounded-full bg-accent text-white hover:bg-accent-light transition"
          >
            Únete
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ================================================================
   MINI STREAK GRID (for hero phone mockup)
   ================================================================ */

function MiniStreakGrid({ inView }: { inView: boolean }) {
  const pattern = [1,1,0,1,1,1,1, 1,0,1,1,1,1,1, 1,1,1,0,1,1,1, 1,1,1,1,1,0,0]
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 4 }).map((_, w) => (
        <div key={w} className="flex flex-col gap-[2px]">
          {Array.from({ length: 7 }).map((_, d) => {
            const idx = w * 7 + d
            const on = pattern[idx]
            return (
              <motion.div
                key={d}
                className={`w-[7px] h-[7px] rounded-[1px] ${on ? 'bg-accent' : 'bg-gray-200'}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.0 + idx * 0.008 }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   HERO
   ================================================================ */

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16">
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/[0.04] blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-muted mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.1 }}
          >
            <Flame className="w-3.5 h-3.5 text-accent" />
            Solo por invitación
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            Sube de
            <br />
            <span className="text-accent">nivel.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted max-w-lg mx-auto lg:mx-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.35 }}
          >
            Trackea hábitos. Gana puntos. Compite con tu squad.
            <br className="hidden sm:block" />{' '}
            <span className="text-foreground font-medium">Como Strava, pero para todo lo que te hace mejor.</span>
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.5 }}
          >
            <a
              href="/access"
              className="px-8 py-3.5 rounded-full bg-accent text-white font-bold text-base hover:bg-accent-light transition hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              Tengo invitación <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#como-funciona"
              className="px-6 py-3.5 rounded-full border border-border text-foreground font-semibold text-base hover:bg-surface transition text-center"
            >
              Cómo funciona
            </a>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col items-center lg:items-start gap-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['CA', 'MA', 'JA', 'DA', 'LU'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-surface border-2 border-white flex items-center justify-center text-[9px] font-bold text-muted"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">
                <span className="text-foreground font-semibold">4.847</span> personas dentro
              </p>
            </div>
            <a href="/access?waitlist=1" className="text-xs text-gray-400 hover:text-muted transition">
              ¿No tienes invitación?
            </a>
          </motion.div>
        </div>

        {/* Phone mockup — dashboard with charts */}
        <motion.div
          className="relative shrink-0"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ ...SPRING, delay: 0.3 }}
        >
          <PhoneFrame>
            <div className="pt-10 px-4 pb-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold tracking-tight text-gray-900">
                  <span className="text-accent">N</span>IVEL
                </span>
                <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
                  <Flame className="w-3.5 h-3.5" /> 14d
                </div>
              </div>

              {/* Level card */}
              <motion.div
                className="bg-gray-50 rounded-xl p-3 mb-3"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-extrabold text-accent">12</span>
                  <span className="text-[9px] text-gray-400">1.440 / 2.000 XP</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '72%' } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Mini heatmap */}
              <motion.div
                className="mb-3"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.9 }}
              >
                <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Tu racha</p>
                <MiniStreakGrid inView={inView} />
              </motion.div>

              {/* Mini bars */}
              <motion.div
                className="mb-3"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.1 }}
              >
                <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Esta semana</p>
                <div className="flex items-end gap-1 h-10">
                  {[65, 80, 45, 90, 95, 30, 0].map((v, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 rounded-sm ${v === 0 ? 'bg-gray-100' : i === 4 ? 'bg-accent' : 'bg-accent/40'}`}
                      initial={{ height: 2 }}
                      animate={inView ? { height: Math.max((v / 100) * 40, 2) } : {}}
                      transition={{ delay: 1.2 + i * 0.05, duration: 0.4 }}
                    />
                  ))}
                </div>
                <div className="flex gap-1 mt-0.5">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <span key={i} className={`flex-1 text-center text-[7px] ${i === 4 ? 'text-accent font-bold' : 'text-gray-400'}`}>{d}</span>
                  ))}
                </div>
              </motion.div>

              {/* Today habits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1.3 }}
              >
                <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Hoy</p>
                <div className="space-y-1.5">
                  {[
                    { name: 'Gym 1h', done: true, pts: 50 },
                    { name: 'Leer 30min', done: true, pts: 30 },
                    { name: 'Meditar', done: false, pts: 15 },
                  ].map((h, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${h.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${h.done ? 'bg-green-500 text-white' : 'border border-gray-300'}`}>
                        {h.done && <Check className="w-2 h-2" />}
                      </div>
                      <span className={`text-[10px] flex-1 ${h.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{h.name}</span>
                      <span className={`text-[9px] font-bold ${h.done ? 'text-green-500' : 'text-gray-400'}`}>+{h.pts}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </PhoneFrame>

          {/* Floating badges */}
          <motion.div
            className="absolute -right-6 top-28 bg-white border border-border rounded-xl p-3 shadow-lg w-44"
            initial={{ opacity: 0, x: 20, scale: 0.85 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ ...SPRING, delay: 1.5 }}
          >
            <motion.div
              animate={inView ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
                <span className="text-[10px] text-accent font-semibold">12 kudos</span>
              </div>
              <p className="text-xs text-gray-700">Tu squad celebra tu racha</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -left-4 bottom-32 bg-white border border-border rounded-xl p-3 shadow-lg"
            initial={{ opacity: 0, x: -20, scale: 0.85 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ ...SPRING, delay: 1.7 }}
          >
            <motion.div
              animate={inView ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] text-accent font-semibold">14 días</span>
              </div>
              <p className="text-xs text-gray-700 mt-0.5">Racha x2 activa</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ================================================================
   ACTIVITY TICKER
   ================================================================ */

function ActivityTicker() {
  const activities = [
    'Carlos completó Gym 1h · +50 pts',
    'María desbloqueó racha de 30 días',
    'David recibió 8 kudos por su racha',
    'Laura retó a Pablo · Running semanal',
    'Ana subió al nivel 15',
    'Los Disciplinados: top squad esta semana',
    'Javier completó todos sus hábitos hoy',
    'Sara lleva 21 días sin fallar',
  ]

  return (
    <section className="py-8 overflow-hidden relative border-y border-border">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none" />
      <div className="relative">
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {[...activities, ...activities].map((n, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 text-sm text-muted"
            >
              <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
              {n}
            </div>
          ))}
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
    { icon: Target, title: 'Elige tus hábitos', desc: 'Gym, lectura, meditación, skincare... los que quieras. Tú pones la dificultad y los puntos.' },
    { icon: Flame, title: 'Cumple y sube', desc: 'Cada hábito completado suma puntos. Las rachas multiplican. 7 días seguidos = puntos dobles.' },
    { icon: Trophy, title: 'Compite con tu squad', desc: 'Ranking semanal, duelos 1v1 y kudos. Tu equipo te empuja a no fallar.' },
  ]

  return (
    <section id="como-funciona" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-16">
          <p className="text-sm text-accent font-semibold uppercase tracking-widest mb-3">Así funciona</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Elige. Cumple. Compite.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.15}>
              <motion.div
                className="relative bg-white rounded-2xl p-6 border border-border shadow-sm h-full"
                whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(252,82,0,0.1)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   WEEKLY RECAP — shows the weekly card as part of the experience
   ================================================================ */

function WeeklyRecap() {
  return (
    <section className="py-24 sm:py-32 bg-surface">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <FadeIn>
              <p className="text-sm text-accent font-semibold uppercase tracking-widest mb-3">Cada semana</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Tu resumen
                <br />
                <span className="text-muted">semanal.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Cada domingo, NIVEL genera tu card con nivel, racha, puntos y posición en el squad.
                <span className="text-foreground font-medium"> Tu progreso de un vistazo.</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 space-y-3 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: BarChart3, text: 'Puntos por día', detail: 'Actividad de lunes a domingo en una gráfica.' },
                  { icon: Flame, text: 'Racha y nivel', detail: 'Tu progreso acumulado semana a semana.' },
                  { icon: Heart, text: 'Posición en el squad', detail: 'Dónde estás respecto a tu equipo.' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{f.text}</p>
                      <p className="text-xs text-muted">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} className="shrink-0">
            <WeeklyShareCard animated compact={false} />
          </FadeIn>
        </div>
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

  const members = [
    { pos: 1, name: 'Carlos', pts: 1240, change: 0 },
    { pos: 2, name: 'María', pts: 980, change: 1 },
    { pos: 3, name: 'Tú', pts: 850, change: -1, isYou: true },
    { pos: 4, name: 'David', pts: 320, change: 0, isLast: true },
  ]

  return (
    <section id="squads" className="py-24 sm:py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <FadeIn>
              <p className="text-sm text-accent font-semibold uppercase tracking-widest mb-3">Squads</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Tu equipo
                <br />
                te mantiene
                <br />
                <span className="text-muted">arriba.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Crea un squad con tus amigos. Compite cada semana. Daos kudos.
                <span className="text-foreground font-medium"> El último invita a las cañas.</span>
              </p>
            </FadeIn>

            <div className="mt-8 space-y-3 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Trophy, text: 'Ranking semanal', detail: 'Compite por ser el primero cada semana' },
                { icon: Swords, text: 'Duelos 1v1', detail: 'Reta a quien quieras. El que pierda, paga.' },
                { icon: BarChart3, text: 'Stats compartidas', detail: 'Ve las stats de todo tu squad' },
              ].map((f, i) => (
                <FadeIn key={i} delay={0.3 + i * 0.1}>
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{f.text}</p>
                      <p className="text-xs text-muted">{f.detail}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <motion.div
            className="shrink-0 w-[300px]"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ ...SPRING, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-border shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-900">Los Disciplinados</p>
                <span className="text-[10px] text-accent font-semibold">Semana 14</span>
              </div>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <motion.div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                      m.isYou ? 'bg-accent/[0.05] border border-accent/10' : 'bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <span className="text-xs font-bold text-gray-400 w-4 tabular-nums">{m.pos}</span>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                      {m.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${m.isYou ? 'text-accent' : 'text-gray-900'}`}>{m.name}</p>
                      {m.isLast && <p className="text-[9px] text-gray-400">Paga las cañas</p>}
                    </div>
                    <span className="text-xs font-bold text-gray-500 tabular-nums">{m.pts.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
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
    <section id="join" className="py-24 sm:py-32 relative">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <FadeIn>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            ¿Listo para subir
            <br />
            <span className="text-accent">de nivel?</span>
          </h2>
          <p className="mt-6 text-lg text-muted max-w-lg mx-auto leading-relaxed">
            NIVEL funciona solo por invitación. Si conoces a alguien dentro, pídele un código.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <a
            href="/access"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-full bg-accent text-white font-bold text-lg hover:bg-accent-light transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Tengo una invitación <ArrowRight className="w-5 h-5" />
          </a>
          <p className="mt-4">
            <a href="/access?waitlist=1" className="text-xs text-gray-400 hover:text-muted transition">
              ¿No tienes? Entra en la lista de espera
            </a>
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
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-muted mt-1">Sube de nivel.</p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { name: 'Twitter', label: '𝕏' },
              { name: 'Instagram', label: 'IG' },
              { name: 'TikTok', label: 'TT' },
            ].map((s) => (
              <a
                key={s.name}
                href="#"
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-muted hover:text-accent hover:border-accent/20 transition"
                aria-label={s.name}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] text-muted mt-8">
          © 2026 NIVEL. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

/* ================================================================
   PAGE — simplified: 5 body sections instead of 8
   ================================================================ */

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <ActivityTicker />
      <HowItWorks />
      <WeeklyRecap />
      <Squads />
      <InviteCTA />
      <Footer />
    </main>
  )
}
