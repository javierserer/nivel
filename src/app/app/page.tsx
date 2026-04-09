'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/shared'
import { StreakHeatmap, WeeklyBars } from '@/components/charts'
import { Heart, Flame, Check, ChevronRight, TrendingUp } from 'lucide-react'

const INITIAL_HABITS = [
  { id: 1, name: 'Gym 1h', pts: 50, done: false },
  { id: 2, name: 'Leer 30min', pts: 30, done: true },
  { id: 3, name: 'Sin alcohol', pts: 30, done: true },
  { id: 4, name: 'Meditar 10min', pts: 15, done: false },
  { id: 5, name: 'Madrugar', pts: 50, done: true },
  { id: 6, name: 'Mascarilla pelo', pts: 15, done: false },
]

const FEED = [
  { name: 'Carlos M.', action: 'Gym 1h', pts: 50, time: 'Hace 12min', kudos: 8, streak: 21 },
  { name: 'María L.', action: 'Meditación 15min', pts: 30, time: 'Hace 45min', kudos: 5 },
  { name: 'David R.', action: 'Leer 30min', pts: 30, time: 'Hace 2h', kudos: 3 },
]

const MOTIVATIONAL = [
  'Te quedan {remaining} para el día perfecto',
  '¡{completed} de {total} hoy! No pares',
  'Tu squad te está mirando',
  'Racha de 14 días. No la rompas hoy.',
]

export default function Dashboard() {
  const [habits, setHabits] = useState(INITIAL_HABITS)
  const [level] = useState(12)
  const [xp] = useState(1440)
  const [xpNeeded] = useState(2000)
  const [earnedToast, setEarnedToast] = useState<string | null>(null)
  const [kudosGiven, setKudosGiven] = useState<number[]>([])

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const newDone = !h.done
          if (newDone) {
            setEarnedToast(`+${h.pts}`)
            setTimeout(() => setEarnedToast(null), 1200)
          }
          return { ...h, done: newDone }
        }
        return h
      })
    )
  }

  const giveKudos = (idx: number) => {
    if (!kudosGiven.includes(idx)) setKudosGiven((k) => [...k, idx])
  }

  const todayEarned = habits.filter((h) => h.done).reduce((sum, h) => sum + h.pts, 0)
  const completedCount = habits.filter((h) => h.done).length
  const remaining = habits.length - completedCount

  const motivMsg = remaining > 0
    ? `Te quedan ${remaining} para el día perfecto`
    : '¡Día perfecto! Todos completados'

  return (
    <div className="pt-14 px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted mb-0.5">Buenos días</p>
          <h1 className="text-xl font-bold">Javier</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent">14d</span>
          </div>
          <Logo size="sm" />
        </div>
      </div>

      {/* Level + XP */}
      <motion.div
        className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-4 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Tu nivel</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-4xl font-extrabold text-accent">{level}</span>
              <span className="text-sm text-muted font-medium">nivel</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted">Hoy</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span className="text-sm font-bold text-accent">+{todayEarned} pts</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted">Nivel {level + 1}</span>
          <span className="text-[10px] text-muted tabular-nums">{xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(xp / xpNeeded) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence>
          {earnedToast && (
            <motion.span
              className="absolute top-3 right-5 text-lg font-bold text-accent"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {earnedToast}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Motivational */}
      <motion.div
        className="bg-accent/[0.05] border border-accent/10 rounded-xl px-4 py-2.5 mb-5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-accent font-medium">{motivMsg}</p>
      </motion.div>

      {/* Streak Heatmap */}
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Tu racha</p>
          <span className="text-[10px] text-accent font-bold">84 días activo</span>
        </div>
        <StreakHeatmap weeks={12} size="md" />
      </div>

      {/* Weekly Bar Chart */}
      <div className="bg-white rounded-2xl p-4 border border-border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Esta semana</p>
          <span className="text-[10px] text-muted">+320 pts</span>
        </div>
        <WeeklyBars data={[65, 80, 45, 90, todayEarned, 0, 0]} />
      </div>

      {/* Today's habits */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Hoy</h2>
          <span className="text-[10px] text-muted">{completedCount}/{habits.length}</span>
        </div>
        <div className="space-y-2">
          {habits.map((h) => (
            <motion.button
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition border shadow-sm ${
                h.done ? 'bg-success-bg border-success/20' : 'bg-white border-border hover:border-accent/20'
              }`}
              whileTap={{ scale: 0.98 }}
              layout
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    h.done ? 'bg-success text-white' : 'border border-gray-300'
                  }`}
                  animate={h.done ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {h.done && <Check className="w-3 h-3" />}
                </motion.div>
                <span className={`text-sm font-medium ${h.done ? 'text-muted line-through' : ''}`}>
                  {h.name}
                </span>
              </div>
              <span className={`text-xs font-bold ${h.done ? 'text-success' : 'text-muted'}`}>+{h.pts}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Squad feed */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Tu squad</h2>
          <a href="/app/squad" className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
            Ver todo <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-2">
          {FEED.map((item, i) => (
            <div key={i} className="bg-white border border-border rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {item.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{item.name}</span>
                    {item.streak && (
                      <span className="text-[10px] text-accent font-bold flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> {item.streak}d
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted">{item.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-sm font-medium">{item.action}</span>
                  <span className="text-xs text-accent font-bold">+{item.pts}</span>
                </div>
                <motion.button
                  onClick={() => giveKudos(i)}
                  className={`flex items-center gap-1 transition ${kudosGiven.includes(i) ? 'text-accent' : 'text-gray-400 hover:text-accent'}`}
                  whileTap={{ scale: 1.3 }}
                >
                  <Heart className={`w-4 h-4 ${kudosGiven.includes(i) ? 'fill-accent' : ''}`} />
                  <span className="text-[10px] font-medium">{item.kudos + (kudosGiven.includes(i) ? 1 : 0)}</span>
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
