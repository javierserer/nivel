'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/shared'
import { Heart, Flame, Check, ChevronRight, TrendingUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HabitWithLog {
  id: string
  name: string
  pts: number
  done: boolean
  log_id: string | null
}

interface FeedItem {
  id: string
  user_id: string
  type: string
  payload: { habit_name?: string; pts?: number; new_level?: number }
  created_at: string
  profiles: { display_name: string | null; avatar_url: string | null }
  kudos_count: number
}

export default function Dashboard() {
  const supabase = createClient()
  const [habits, setHabits] = useState<HabitWithLog[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [profile, setProfile] = useState<{ display_name: string | null; level: number; xp: number; streak: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [earnedToast, setEarnedToast] = useState<string | null>(null)
  const [kudosGiven, setKudosGiven] = useState<Set<string>>(new Set())

  const today = new Date().toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, habitsRes, logsRes, feedRes] = await Promise.all([
      supabase.from('profiles').select('display_name, level, xp, streak').eq('id', user.id).single(),
      supabase.from('habits').select('id, name, pts').eq('user_id', user.id).eq('active', true).order('created_at'),
      supabase.from('habit_logs').select('id, habit_id, completed').eq('user_id', user.id).eq('log_date', today),
      supabase
        .from('activity')
        .select('id, user_id, type, payload, created_at, profiles!activity_user_id_fkey(display_name, avatar_url)')
        .in('squad_id', (await supabase.from('squad_members').select('squad_id').eq('user_id', user.id)).data?.map(s => s.squad_id) || [])
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    setProfile(profileRes.data)

    if (habitsRes.data) {
      const merged = habitsRes.data.map(h => {
        const log = logsRes.data?.find(l => l.habit_id === h.id)
        return { ...h, done: log?.completed || false, log_id: log?.id || null }
      })
      setHabits(merged)
    }

    if (feedRes.data) {
      const feedWithKudos = await Promise.all(
        feedRes.data.map(async (item) => {
          const { count } = await supabase
            .from('kudos')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', item.id)
          return {
            ...item,
            profiles: item.profiles as unknown as { display_name: string | null; avatar_url: string | null },
            kudos_count: count || 0,
          }
        })
      )
      setFeed(feedWithKudos)
    }

    setLoading(false)
  }, [supabase, today])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleHabit = async (habit: HabitWithLog) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newDone = !habit.done
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, done: newDone } : h))

    if (newDone) {
      setEarnedToast(`+${habit.pts}`)
      setTimeout(() => setEarnedToast(null), 1200)

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habit.id, user_id: user.id, log_date: today, completed: true, pts_earned: habit.pts },
          { onConflict: 'habit_id,log_date' }
        )
        .select('id')
        .single()

      if (error) {
        setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, done: false } : h))
        return
      }

      if (data) {
        setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, log_id: data.id } : h))
      }

      const { data: freshProfile } = await supabase.from('profiles').select('level, xp, streak').eq('id', user.id).single()
      if (freshProfile) setProfile(p => p ? { ...p, ...freshProfile } : p)
    } else {
      const logId = habit.log_id
      if (logId) {
        await supabase.from('habit_logs').delete().eq('id', logId)
      } else {
        await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('log_date', today).eq('user_id', user.id)
      }
      setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, log_id: null } : h))
    }
  }

  const giveKudos = async (activityId: string) => {
    if (kudosGiven.has(activityId)) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setKudosGiven(prev => new Set(prev).add(activityId))
    await supabase.from('kudos').insert({ from_user: user.id, to_user: feed.find(f => f.id === activityId)!.user_id, activity_id: activityId })
    setFeed(prev => prev.map(f => f.id === activityId ? { ...f, kudos_count: f.kudos_count + 1 } : f))
  }

  const xpForLevel = (lvl: number) => Math.floor(500 * Math.pow(1.15, lvl - 1))
  const xpNeeded = profile ? xpForLevel(profile.level) : 2000
  const todayEarned = habits.filter(h => h.done).reduce((s, h) => s + h.pts, 0)
  const completedCount = habits.filter(h => h.done).length
  const remaining = habits.length - completedCount
  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 20 ? 'Buenas tardes' : 'Buenas noches'

  const motivMsg = remaining === 0
    ? '¡Día perfecto! Todos completados'
    : remaining <= 2
      ? `Te quedan ${remaining} para el día perfecto`
      : `Te quedan ${remaining} para el día perfecto`

  if (loading) {
    return (
      <div className="pt-14 px-5 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mt-20" />
      </div>
    )
  }

  return (
    <div className="pt-14 px-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted mb-0.5">{greeting}</p>
          <h1 className="text-xl font-bold">{profile?.display_name || 'Nivel'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent">{profile?.streak || 0}d</span>
          </div>
          <Logo size="sm" />
        </div>
      </div>

      <motion.div
        className="bg-white rounded-xl px-4 py-3 border border-border shadow-sm mb-3 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-accent">{profile?.level || 1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted">Nivel {(profile?.level || 1) + 1}</span>
              <span className="text-[10px] text-muted tabular-nums">{(profile?.xp || 0).toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((profile?.xp || 0) / xpNeeded) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1 pl-2 border-l border-border">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-xs font-bold text-accent">+{todayEarned}</span>
          </div>
        </div>

        <AnimatePresence>
          {earnedToast && (
            <motion.span
              className="absolute top-1 right-4 text-sm font-bold text-accent"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -16 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {earnedToast}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {habits.length > 0 && (
        <motion.p
          className="text-[11px] text-accent font-medium text-center mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {motivMsg}
        </motion.p>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Hoy</h2>
          <span className="text-[10px] text-muted">{completedCount}/{habits.length}</span>
        </div>
        {habits.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted mb-2">Aún no tienes hábitos</p>
            <a href="/dashboard/habits" className="text-sm text-accent font-semibold">Añadir hábitos</a>
          </div>
        )}
        <div className="space-y-2">
          {habits.map(h => (
            <motion.button
              key={h.id}
              onClick={() => toggleHabit(h)}
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

      {feed.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">Tu squad</h2>
            <a href="/dashboard/squad" className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
              Ver todo <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-2">
            {feed.map(item => {
              const name = item.profiles?.display_name || 'Alguien'
              const actionText = item.type === 'habit_completed'
                ? item.payload.habit_name || 'un hábito'
                : item.type === 'level_up'
                  ? `subió al nivel ${item.payload.new_level}`
                  : item.type
              const pts = item.payload.pts || 0
              const timeAgo = getTimeAgo(item.created_at)

              return (
                <div key={item.id} className="bg-white border border-border rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                      {item.profiles?.avatar_url ? (
                        <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : name[0]}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold">{name}</span>
                    </div>
                    <span className="text-[10px] text-muted">{timeAgo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-sm font-medium">{actionText}</span>
                      {pts > 0 && <span className="text-xs text-accent font-bold">+{pts}</span>}
                    </div>
                    <motion.button
                      onClick={() => giveKudos(item.id)}
                      className={`flex items-center gap-1 transition ${kudosGiven.has(item.id) ? 'text-accent' : 'text-gray-400 hover:text-accent'}`}
                      whileTap={{ scale: 1.3 }}
                    >
                      <Heart className={`w-4 h-4 ${kudosGiven.has(item.id) ? 'fill-accent' : ''}`} />
                      <span className="text-[10px] font-medium">{item.kudos_count}</span>
                    </motion.button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}
