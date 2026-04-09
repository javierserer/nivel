'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Heart, Swords, UserPlus, Loader2, Users, Copy, Check } from 'lucide-react'
import { ComparisonBars } from '@/components/charts'
import { createClient } from '@/lib/supabase/client'

interface Member {
  pos: number
  name: string
  initials: string
  avatar_url: string | null
  pts: number
  change: number
  isYou?: boolean
  isLast?: boolean
  user_id: string
}

interface FeedItem {
  id: string
  text: string
  time: string
  type: 'alert' | 'kudos' | 'achievement'
}

interface Duel {
  id: string
  challenger_name: string
  challenged_name: string
  habit_name: string
  stake: string | null
  status: string
  progress: Record<string, unknown>
  is_challenger: boolean
}

export default function SquadPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<'ranking' | 'feed' | 'duels'>('ranking')
  const [members, setMembers] = useState<Member[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [duels, setDuels] = useState<Duel[]>([])
  const [squad, setSquad] = useState<{ id: string; name: string; invite_code: string; weekly_challenge: string | null; week_number: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [noSquad, setNoSquad] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: membership } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership) {
      setNoSquad(true)
      setLoading(false)
      return
    }

    const { data: squadData } = await supabase
      .from('squads')
      .select('*')
      .eq('id', membership.squad_id)
      .single()

    setSquad(squadData)

    const { data: membersData } = await supabase
      .from('squad_members')
      .select('user_id, profiles!squad_members_user_id_fkey(display_name, username, avatar_url)')
      .eq('squad_id', membership.squad_id)

    if (membersData) {
      const weekStart = getWeekStart()

      const membersPts = await Promise.all(
        membersData.map(async (m) => {
          const profile = m.profiles as unknown as { display_name: string | null; username: string | null; avatar_url: string | null }
          const { data: logs } = await supabase
            .from('habit_logs')
            .select('pts_earned')
            .eq('user_id', m.user_id)
            .gte('log_date', weekStart)
            .eq('completed', true)

          const pts = logs?.reduce((s, l) => s + l.pts_earned, 0) || 0
          const name = profile?.display_name || profile?.username || 'Anónimo'
          return {
            user_id: m.user_id,
            name,
            initials: name.slice(0, 2).toUpperCase(),
            avatar_url: profile?.avatar_url || null,
            pts,
            isYou: m.user_id === user.id,
          }
        })
      )

      const sorted = membersPts
        .sort((a, b) => b.pts - a.pts)
        .map((m, i) => ({
          ...m,
          pos: i + 1,
          change: 0,
          isLast: i === membersPts.length - 1 && membersPts.length > 1,
        }))

      setMembers(sorted)
    }

    const { data: activityData } = await supabase
      .from('activity')
      .select('id, user_id, type, payload, created_at, profiles!activity_user_id_fkey(display_name)')
      .eq('squad_id', membership.squad_id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (activityData) {
      const feedItems: FeedItem[] = activityData.map(a => {
        const profile = a.profiles as unknown as { display_name: string | null }
        const name = profile?.display_name || 'Alguien'
        const payload = a.payload as { habit_name?: string; pts?: number; new_level?: number }
        let text = ''
        let type: 'kudos' | 'achievement' | 'alert' = 'kudos'

        if (a.type === 'habit_completed') {
          text = `${name} completó ${payload.habit_name || 'un hábito'} (+${payload.pts || 0} pts)`
        } else if (a.type === 'level_up') {
          text = `${name} subió al nivel ${payload.new_level}`
          type = 'achievement'
        } else if (a.type === 'streak_milestone') {
          text = `${name} alcanzó una racha increíble`
          type = 'achievement'
        } else {
          text = `${name}: ${a.type}`
        }

        return { id: a.id, text, time: getTimeAgo(a.created_at), type }
      })
      setFeed(feedItems)
    }

    const { data: duelsData } = await supabase
      .from('duels')
      .select('*, challenger:profiles!duels_challenger_id_fkey(display_name), challenged:profiles!duels_challenged_id_fkey(display_name)')
      .eq('squad_id', membership.squad_id)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })

    if (duelsData) {
      setDuels(duelsData.map(d => ({
        id: d.id,
        challenger_name: (d.challenger as unknown as { display_name: string })?.display_name || 'Alguien',
        challenged_name: (d.challenged as unknown as { display_name: string })?.display_name || 'Alguien',
        habit_name: d.habit_name,
        stake: d.stake,
        status: d.status,
        progress: d.progress as Record<string, unknown>,
        is_challenger: d.challenger_id === user.id,
      })))
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const copySquadCode = () => {
    if (squad?.invite_code) {
      navigator.clipboard.writeText(squad.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="pt-14 px-5 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mt-20" />
      </div>
    )
  }

  if (noSquad) {
    return (
      <div className="pt-14 px-5 text-center">
        <Users className="w-12 h-12 text-muted mx-auto mt-16 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sin squad</h2>
        <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
          Crea un squad o pide un código a tus amigos para unirte.
        </p>
        <a href="/dashboard/profile" className="text-accent font-semibold text-sm">Ir a perfil para crear uno</a>
      </div>
    )
  }

  return (
    <div className="pt-14 px-5">
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Squad</p>
            <h1 className="text-xl font-bold">{squad?.name}</h1>
          </div>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : m.initials}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted">Semana {squad?.week_number}</p>
          <button onClick={copySquadCode} className="text-[10px] text-accent font-semibold flex items-center gap-1">
            {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Código</>}
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 border border-border shadow-sm mb-5">
        {[
          { id: 'ranking' as const, label: 'Ranking' },
          { id: 'feed' as const, label: 'Feed' },
          { id: 'duels' as const, label: 'Duelos' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              tab === t.id ? 'bg-accent text-white' : 'text-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'ranking' && (
          <motion.div key="ranking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {squad?.weekly_challenge && (
              <div className="bg-white border border-border rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <p className="text-xs font-bold">Reto semanal: {squad.weekly_challenge}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {members.map((m, i) => {
                const youMember = members.find(x => x.isYou)
                const above = i > 0 ? members[i - 1] : null
                const diff = youMember && m.isYou && above ? above.pts - youMember.pts : 0

                return (
                  <div key={m.user_id}>
                    <motion.div
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border shadow-sm ${
                        m.isYou ? 'bg-accent/[0.04] border-accent/15' : 'bg-white border-border'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <span className="text-xs font-bold text-muted w-4 text-center tabular-nums">{m.pos}</span>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                        {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : m.initials}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${m.isYou ? 'text-accent' : ''}`}>
                          {m.isYou ? 'Tú' : m.name}
                        </p>
                        {m.isLast && members.length > 1 && <p className="text-[10px] text-muted">Invita a las cañas</p>}
                      </div>
                      <span className="text-sm font-bold text-muted tabular-nums">{m.pts.toLocaleString()}</span>
                    </motion.div>

                    {m.isYou && diff > 0 && above && (
                      <motion.div
                        className="flex items-center gap-2 bg-accent/[0.06] rounded-lg px-4 py-2 mt-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.5 }}
                      >
                        <Flame className="w-3 h-3 text-accent shrink-0" />
                        <p className="text-[11px] text-accent font-medium">
                          A {diff} pts de {above.name}. ¡Una sesión más y le adelantas!
                        </p>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>

            {members.length > 1 && (
              <div className="bg-white border border-border rounded-xl p-4 mt-4 shadow-sm">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Esta semana</p>
                <ComparisonBars members={members.map(m => ({ name: m.isYou ? 'Tú' : m.name, pts: m.pts, isYou: m.isYou }))} />
              </div>
            )}

            <motion.button
              onClick={copySquadCode}
              className="w-full mt-4 py-3.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-accent hover:border-accent/30 transition flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus className="w-4 h-4" /> Invitar al squad
            </motion.button>
          </motion.div>
        )}

        {tab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {feed.length === 0 && (
              <p className="text-sm text-muted text-center py-8">Aún no hay actividad. ¡Completa un hábito!</p>
            )}
            <div className="space-y-2">
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  className={`bg-white rounded-xl px-4 py-3 border shadow-sm ${
                    item.type === 'alert' ? 'border-red-200' : item.type === 'achievement' ? 'border-accent/20' : 'border-border'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <p className="text-xs leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-muted mt-1">{item.time}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'duels' && (
          <motion.div key="duels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {duels.length === 0 && (
              <p className="text-sm text-muted text-center py-8">Sin duelos activos.</p>
            )}
            <div className="space-y-3">
              {duels.map(d => (
                <div key={d.id} className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Swords className="w-3.5 h-3.5 text-accent" />
                      <p className="text-xs font-bold">{d.challenger_name} vs {d.challenged_name}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      d.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-muted'
                    }`}>
                      {d.status === 'active' ? 'En curso' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{d.habit_name}</p>
                  {d.stake && (
                    <p className="text-[10px] text-muted">En juego: <span className="text-accent font-medium">{d.stake}</span></p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}
