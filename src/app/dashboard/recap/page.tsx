'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Zap, Calendar, Loader2 } from 'lucide-react'
import { WeeklyBars, StreakHeatmap } from '@/components/charts'
import { createClient } from '@/lib/supabase/client'

const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }

interface WeekData {
  week: number
  balance: number
  previousBalance: number
  streak: number
  habits: { name: string; done: number; total: number }[]
  squadPosition: number
  dailyPts: number[]
}

interface PastWeek {
  week: number
  pts: number
  pct: number
  highlight: string
}

export default function RecapPage() {
  const supabase = createClient()
  const [thisWeek, setThisWeek] = useState<WeekData | null>(null)
  const [pastWeeks, setPastWeeks] = useState<PastWeek[]>([])
  const [heatmapData, setHeatmapData] = useState<number[]>([])
  const [personalBests, setPersonalBests] = useState<{ label: string; value: string; icon: typeof Zap }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekStart = getWeekStart(0)
    const prevWeekStart = getWeekStart(1)
    const currentWeekNum = getWeekNumber()

    // Profile for streak
    const { data: profile } = await supabase.from('profiles').select('streak, best_streak').eq('id', user.id).single()

    // Current week logs
    const { data: weekLogs } = await supabase
      .from('habit_logs')
      .select('habit_id, pts_earned, log_date, completed, habits!habit_logs_habit_id_fkey(name)')
      .eq('user_id', user.id)
      .gte('log_date', weekStart)
      .eq('completed', true)

    // Previous week logs
    const { data: prevLogs } = await supabase
      .from('habit_logs')
      .select('pts_earned')
      .eq('user_id', user.id)
      .gte('log_date', prevWeekStart)
      .lt('log_date', weekStart)
      .eq('completed', true)

    // Active habits
    const { data: activeHabits } = await supabase
      .from('habits')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('active', true)

    const balance = weekLogs?.reduce((s, l) => s + l.pts_earned, 0) || 0
    const previousBalance = prevLogs?.reduce((s, l) => s + l.pts_earned, 0) || 0

    // Daily points for this week
    const dailyPts = [0, 0, 0, 0, 0, 0, 0]
    weekLogs?.forEach(l => {
      const d = new Date(l.log_date + 'T12:00:00')
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
      dailyPts[dayIdx] += l.pts_earned
    })

    // Habit breakdown
    const habitMap = new Map<string, { done: number; total: number }>()
    activeHabits?.forEach(h => habitMap.set(h.name, { done: 0, total: 7 }))
    weekLogs?.forEach(l => {
      const name = (l.habits as unknown as { name: string })?.name
      if (name && habitMap.has(name)) {
        const entry = habitMap.get(name)!
        entry.done++
      }
    })

    const habits = Array.from(habitMap.entries()).map(([name, data]) => ({
      name, done: data.done, total: data.total,
    }))

    setThisWeek({
      week: currentWeekNum,
      balance,
      previousBalance,
      streak: profile?.streak || 0,
      habits,
      squadPosition: 0,
      dailyPts,
    })

    // Heatmap data (16 weeks = 112 days, including today)
    const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const heatStart = new Date()
    heatStart.setDate(heatStart.getDate() - 111)
    const { data: heatLogs } = await supabase
      .from('habit_logs')
      .select('log_date, pts_earned')
      .eq('user_id', user.id)
      .gte('log_date', localDate(heatStart))
      .eq('completed', true)

    const hm: number[] = []
    for (let i = 0; i < 112; i++) {
      const d = new Date(heatStart)
      d.setDate(d.getDate() + i)
      hm.push(heatLogs?.filter(l => l.log_date === localDate(d)).reduce((s, l) => s + l.pts_earned, 0) || 0)
    }
    setHeatmapData(hm)

    // Past weeks
    const pw: PastWeek[] = []
    for (let w = 1; w <= 4; w++) {
      const ws = getWeekStart(w)
      const we = getWeekStart(w - 1)
      const { data: wLogs } = await supabase
        .from('habit_logs')
        .select('pts_earned')
        .eq('user_id', user.id)
        .gte('log_date', ws)
        .lt('log_date', we)
        .eq('completed', true)

      const pts = wLogs?.reduce((s, l) => s + l.pts_earned, 0) || 0
      pw.push({
        week: currentWeekNum - w,
        pts,
        pct: 0,
        highlight: pts > 0 ? `+${pts} pts` : 'Sin actividad',
      })
    }
    setPastWeeks(pw)

    // Personal bests
    const { data: allTimeLogs } = await supabase
      .from('habit_logs')
      .select('pts_earned, log_date')
      .eq('user_id', user.id)
      .eq('completed', true)

    let bestDay = 0
    let bestWeek = 0
    const dayTotals = new Map<string, number>()
    allTimeLogs?.forEach(l => {
      const existing = dayTotals.get(l.log_date) || 0
      dayTotals.set(l.log_date, existing + l.pts_earned)
      if (existing + l.pts_earned > bestDay) bestDay = existing + l.pts_earned
    })

    // Simple best week calc
    bestWeek = Math.max(balance, previousBalance, ...pw.map(w => w.pts))

    setPersonalBests([
      { label: 'Mejor semana', value: `${bestWeek} pts`, icon: Zap },
      { label: 'Mejor día', value: `${bestDay} pts`, icon: TrendingUp },
      { label: 'Mejor racha', value: `${profile?.best_streak || 0} días`, icon: Flame },
      { label: 'Días activos', value: String(dayTotals.size), icon: Calendar },
    ])

    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="pt-14 px-5 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mt-20" />
      </div>
    )
  }

  if (!thisWeek) return null

  const totalDone = thisWeek.habits.reduce((s, h) => s + h.done, 0)
  const totalTotal = thisWeek.habits.reduce((s, h) => s + h.total, 0)
  const completionRate = totalTotal > 0 ? Math.round((totalDone / totalTotal) * 100) : 0
  const balanceDiff = thisWeek.balance - thisWeek.previousBalance

  return (
    <div className="pt-14 px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Tu progreso</h1>
        <span className="text-xs text-muted">Semana {thisWeek.week}</span>
      </div>

      <motion.div
        className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-accent">{completionRate}%</p>
            <p className="text-[10px] text-muted">Completado</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold">+{thisWeek.balance}</p>
            <p className="text-[10px] text-muted">Puntos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-accent flex items-center gap-1"><Flame className="w-6 h-6" />{thisWeek.streak}</p>
            <p className="text-[10px] text-muted">Racha</p>
          </div>
        </div>
        {thisWeek.previousBalance > 0 && (
          <div className="bg-surface rounded-xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs text-muted">vs semana anterior</span>
            </div>
            <span className={`text-xs font-bold ${balanceDiff >= 0 ? 'text-accent' : 'text-muted'}`}>
              {balanceDiff >= 0 ? '+' : ''}{balanceDiff} pts
            </span>
          </div>
        )}
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-4 border border-border shadow-sm mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Actividad</p>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-accent" />
            <span className="text-[10px] text-accent font-bold">{thisWeek.streak}d racha</span>
          </div>
        </div>
        <StreakHeatmap weeks={16} size="sm" data={heatmapData} fullWidth />
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Puntos por día</p>
          <WeeklyBars data={thisWeek.dailyPts} maxHeight={70} />
        </div>
      </motion.div>

      {thisWeek.habits.length > 0 && (
        <motion.div
          className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
        >
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">Hábitos</p>
          <div className="space-y-3">
            {thisWeek.habits.map((h, i) => {
              const pct = h.total > 0 ? (h.done / h.total) * 100 : 0
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING, delay: 0.2 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted">{h.name}</span>
                    <span className={`text-xs font-bold ${pct === 100 ? 'text-accent' : ''}`}>{h.done}/{h.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${pct === 100 ? 'bg-accent' : 'bg-accent/40'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
      >
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Personal bests</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {personalBests.map((pb, i) => (
            <motion.div
              key={i}
              className="shrink-0 bg-white border border-border rounded-xl px-3.5 py-3 shadow-sm min-w-[120px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
            >
              <pb.icon className="w-3.5 h-3.5 text-accent mb-1.5" />
              <p className="text-base font-extrabold leading-tight">{pb.value}</p>
              <p className="text-[9px] text-muted mt-0.5">{pb.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {pastWeeks.some(w => w.pts > 0) && (
        <>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Semanas anteriores</p>
          <div className="space-y-2 mb-8">
            {pastWeeks.filter(w => w.pts > 0).map((w, i) => {
              const maxPts = Math.max(...pastWeeks.map(p => p.pts), 1)
              return (
                <motion.div
                  key={i}
                  className="bg-white border border-border rounded-xl px-4 py-3 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-muted tabular-nums w-7">S{w.week}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent/40 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(w.pts / maxPts) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent tabular-nums">+{w.pts}</span>
                  </div>
                  <div className="flex items-center justify-between pl-10">
                    <p className="text-[10px] text-muted">{w.highlight}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function getWeekStart(weeksAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - weeksAgo * 7)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getWeekNumber(): number {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}
