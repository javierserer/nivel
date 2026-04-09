'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared'
import { Flame, Trophy, Copy, Check, LogOut, Camera, Loader2, Users, Plus } from 'lucide-react'
import { StreakHeatmap } from '@/components/charts'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/hooks'

const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }

interface Stats {
  totalPts: number
  habitsCompleted: number
  perfectDays: number
  bestStreak: number
  kudosReceived: number
}

interface Invitation {
  id: string
  code: string
  used: boolean
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [heatmapData, setHeatmapData] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Squad creation state
  const [showCreateSquad, setShowCreateSquad] = useState(false)
  const [newSquadName, setNewSquadName] = useState('')
  const [squadJoinCode, setSquadJoinCode] = useState('')
  const [hasSquad, setHasSquad] = useState(false)
  const [squadSaving, setSquadSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, ptsRes, habitsCompletedRes, kudosRes, invitationsRes, membershipRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('habit_logs').select('pts_earned').eq('user_id', user.id).eq('completed', true),
      supabase.from('habit_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
      supabase.from('kudos').select('id', { count: 'exact', head: true }).eq('to_user', user.id),
      supabase.from('invitations').select('id, code, used_by').eq('owner_id', user.id),
      supabase.from('squad_members').select('squad_id').eq('user_id', user.id).limit(1),
    ])

    setProfile(profileRes.data)
    setHasSquad((membershipRes.data?.length ?? 0) > 0)

    const totalPts = ptsRes.data?.reduce((s, l) => s + l.pts_earned, 0) || 0
    setStats({
      totalPts,
      habitsCompleted: habitsCompletedRes.count || 0,
      perfectDays: 0,
      bestStreak: profileRes.data?.best_streak || 0,
      kudosReceived: kudosRes.count || 0,
    })

    setInvitations(invitationsRes.data?.map(i => ({
      id: i.id,
      code: i.code,
      used: i.used_by !== null,
    })) || [])

    // Build heatmap data (last 14 weeks = 98 days, including today)
    const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 97)
    const { data: heatLogs } = await supabase
      .from('habit_logs')
      .select('log_date, pts_earned')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('log_date', localDate(startDate))

    const heatmap: number[] = []
    for (let i = 0; i < 98; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dayPts = heatLogs?.filter(l => l.log_date === localDate(d)).reduce((s, l) => s + l.pts_earned, 0) || 0
      heatmap.push(dayPts)
    }
    setHeatmapData(heatmap)

    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = async () => {
      const size = Math.min(img.width, img.height)
      canvas.width = 256
      canvas.height = 256
      ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 256, 256)
      const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/jpeg', 0.85))
      const path = `${user.id}/avatar.jpg`

      await supabase.storage.from('avatars').upload(path, blob, { upsert: true })
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatar_url = urlData.publicUrl + '?t=' + Date.now()

      await supabase.from('profiles').update({ avatar_url }).eq('id', user.id)
      setProfile(p => p ? { ...p, avatar_url } : p)
      setUploading(false)
    }
    img.src = URL.createObjectURL(file)
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleSetting = async (field: 'notify_squad' | 'notify_reminders' | 'public_profile') => {
    if (!profile) return
    const newValue = !profile[field]
    setProfile({ ...profile, [field]: newValue })
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ [field]: newValue }).eq('id', user.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const createSquad = async () => {
    if (!newSquadName.trim()) return
    setSquadSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSquadSaving(false); return }

    const { data: squad } = await supabase
      .from('squads')
      .insert({ name: newSquadName.trim(), created_by: user.id })
      .select('id')
      .single()

    if (squad) {
      await supabase.from('squad_members').insert({ squad_id: squad.id, user_id: user.id, role: 'owner' })
      setHasSquad(true)
    }
    setSquadSaving(false)
    setShowCreateSquad(false)
    setNewSquadName('')
  }

  const joinSquad = async () => {
    if (!squadJoinCode.trim()) return
    setSquadSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSquadSaving(false); return }

    const { data: squad } = await supabase
      .from('squads')
      .select('id')
      .eq('invite_code', squadJoinCode.trim().toUpperCase())
      .single()

    if (squad) {
      await supabase.from('squad_members').insert({ squad_id: squad.id, user_id: user.id })
      setHasSquad(true)
    }
    setSquadSaving(false)
    setSquadJoinCode('')
  }

  const xpForLevel = (lvl: number) => Math.floor(500 * Math.pow(1.15, lvl - 1))

  if (loading) {
    return (
      <div className="pt-14 px-5 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mt-20" />
      </div>
    )
  }

  const xpNeeded = xpForLevel(profile?.level || 1)
  const xpProgress = Math.round(((profile?.xp || 0) / xpNeeded) * 100)
  const availableInvites = invitations.filter(i => !i.used)
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : ''

  const statCards = [
    { label: 'Puntos totales', value: (stats?.totalPts || 0).toLocaleString('es-ES') },
    { label: 'Hábitos completados', value: (stats?.habitsCompleted || 0).toLocaleString('es-ES') },
    { label: 'Días perfectos', value: String(stats?.perfectDays || 0) },
    { label: 'Mejor racha', value: `${stats?.bestStreak || 0}d` },
    { label: 'Kudos recibidos', value: String(stats?.kudosReceived || 0) },
  ]

  return (
    <div className="pt-14 px-5">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-lg font-bold text-muted overflow-hidden"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          ) : profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile?.display_name?.slice(0, 2).toUpperCase() || '?'
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
            <Camera className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition" />
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile?.display_name || 'Sin nombre'}</h1>
          <p className="text-xs text-muted">@{profile?.username || 'user'} · Desde {memberSince}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-accent font-bold bg-accent/10 rounded-full px-2.5 py-0.5">
              LVL {profile?.level || 1}
            </span>
            <span className="text-xs text-muted font-bold flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-accent" /> {profile?.streak || 0}d
            </span>
          </div>
        </div>
      </div>

      <motion.div
        className="bg-white border border-border rounded-xl p-4 mb-6 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Progreso a LVL {(profile?.level || 1) + 1}</span>
          <span className="text-xs text-accent font-bold">{xpProgress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5 tabular-nums">{(profile?.xp || 0).toLocaleString()} / {xpNeeded.toLocaleString()} XP</p>
      </motion.div>

      <div className="bg-white border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Actividad</p>
          <span className="text-[10px] text-accent font-bold">{heatmapData.filter(v => v > 0).length} días</span>
        </div>
        <StreakHeatmap weeks={14} size="sm" animated={false} data={heatmapData} fullWidth />
      </div>

      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Estadísticas</h2>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            className="bg-white border border-border rounded-xl p-3 text-center shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <p className="text-lg font-extrabold">{s.value}</p>
            <p className="text-[9px] text-muted leading-tight mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {!hasSquad && (
        <>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Squad</h2>
          <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-bold">Aún no tienes squad</p>
                <p className="text-xs text-muted">Crea uno o únete con un código</p>
              </div>
            </div>
            {showCreateSquad ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSquadName}
                  onChange={e => setNewSquadName(e.target.value)}
                  placeholder="Nombre del squad"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    onClick={createSquad}
                    disabled={squadSaving || !newSquadName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-accent text-white text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
                    whileTap={{ scale: 0.97 }}
                  >
                    {squadSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Crear'}
                  </motion.button>
                  <button onClick={() => setShowCreateSquad(false)} className="flex-1 py-2.5 rounded-xl border border-border text-xs text-muted">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <motion.button
                  onClick={() => setShowCreateSquad(true)}
                  className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold flex items-center justify-center gap-1"
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="w-3 h-3" /> Crear squad
                </motion.button>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={squadJoinCode}
                    onChange={e => setSquadJoinCode(e.target.value)}
                    placeholder="Código de squad"
                    className="flex-1 px-3 py-2.5 bg-surface border border-border rounded-xl text-xs font-mono uppercase placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                  />
                  <motion.button
                    onClick={joinSquad}
                    disabled={squadSaving || !squadJoinCode.trim()}
                    className="px-4 py-2.5 rounded-xl border border-accent/20 text-xs text-accent font-bold disabled:opacity-30"
                    whileTap={{ scale: 0.97 }}
                  >
                    {squadSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Unirme'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {invitations.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Tus invitaciones</h2>
          <div className="bg-white border border-accent/15 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold">Invitaciones disponibles</p>
                <p className="text-xs text-muted mt-0.5">Elige bien.</p>
              </div>
              <p className="text-2xl font-extrabold text-accent">
                {availableInvites.length} <span className="text-sm text-muted font-normal">/ {invitations.length}</span>
              </p>
            </div>

            {availableInvites.length > 0 && (
              <div className="space-y-2 mb-4">
                {availableInvites.slice(0, 3).map(inv => (
                  <div key={inv.id} className="flex gap-2">
                    <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-xs text-muted font-mono truncate">
                      {inv.code}
                    </div>
                    <motion.button
                      onClick={() => copyInviteCode(inv.code)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                        copied === inv.code ? 'bg-success/10 text-success' : 'bg-accent text-white'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied === inv.code ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Ajustes</h2>
      <div className="bg-white border border-border rounded-xl divide-y divide-border mb-6 shadow-sm">
        {[
          { field: 'notify_squad' as const, label: 'Notificaciones de squad', desc: 'Recibe kudos y actividad' },
          { field: 'notify_reminders' as const, label: 'Recordatorios diarios', desc: 'A las 9:00 y 21:00' },
          { field: 'public_profile' as const, label: 'Perfil público', desc: 'Visible en rankings globales' },
        ].map(setting => (
          <button
            key={setting.field}
            onClick={() => toggleSetting(setting.field)}
            className="flex items-center justify-between px-4 py-3.5 w-full text-left"
          >
            <div>
              <p className="text-sm">{setting.label}</p>
              <p className="text-[10px] text-muted">{setting.desc}</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${profile?.[setting.field] ? 'bg-accent' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${profile?.[setting.field] ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl border border-border text-muted text-sm font-medium hover:text-red-500 hover:border-red-200 transition mb-8"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>

      <div className="text-center pb-4">
        <Logo size="sm" />
        <p className="text-[10px] text-muted mt-1">v0.2.0</p>
      </div>
    </div>
  )
}
