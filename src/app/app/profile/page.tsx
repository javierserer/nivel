'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared'
import { Flame, Trophy, Copy, Check, LogOut } from 'lucide-react'
import { StreakHeatmap } from '@/components/charts'
import Link from 'next/link'

const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }

const STATS = [
  { label: 'Puntos totales', value: '12.480' },
  { label: 'Hábitos completados', value: '847' },
  { label: 'Días perfectos', value: '38' },
  { label: 'Duelos ganados', value: '12' },
  { label: 'Mejor racha', value: '32d' },
  { label: 'Semanas activo', value: '14' },
]

const ACHIEVEMENTS = [
  { name: 'Ironman', desc: '30 días de gym seguidos', unlocked: true },
  { name: 'Monje', desc: '30 días sin alcohol', unlocked: false, progress: 21 },
  { name: 'Duelista', desc: 'Gana 10 duelos', unlocked: true },
  { name: 'Madrugador', desc: '21 días levantándote antes de las 7', unlocked: false, progress: 14 },
  { name: 'Sin deuda', desc: 'Nunca en saldo negativo 4 semanas', unlocked: true },
]

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const xpProgress = 72

  return (
    <div className="pt-14 px-5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-lg font-bold text-muted">
          JA
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Javier</h1>
          <p className="text-xs text-muted">@javier · Desde feb 2026</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-accent font-bold bg-accent/10 rounded-full px-2.5 py-0.5">
              LVL 23
            </span>
            <span className="text-xs text-muted font-bold flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-accent" /> 14d
            </span>
          </div>
        </div>
      </div>

      {/* XP */}
      <motion.div
        className="bg-white border border-border rounded-xl p-4 mb-6 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Progreso a LVL 24</span>
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
        <p className="text-[10px] text-muted mt-1.5 tabular-nums">1.440 / 2.000 XP</p>
      </motion.div>

      {/* Streak Heatmap */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Actividad</p>
          <span className="text-[10px] text-accent font-bold">84 días</span>
        </div>
        <StreakHeatmap weeks={14} size="sm" animated={false} />
      </div>

      {/* Stats */}
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Estadísticas</h2>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {STATS.map((s, i) => (
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

      {/* Achievements */}
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Logros</h2>
      <div className="space-y-2 mb-6">
        {ACHIEVEMENTS.map((a, i) => (
          <div key={i} className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm ${a.unlocked ? 'border-accent/15' : 'border-border opacity-50'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.unlocked ? 'bg-accent/10' : 'bg-gray-100'}`}>
              {a.unlocked ? <Trophy className="w-4 h-4 text-accent" /> : <Trophy className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${a.unlocked ? '' : 'text-muted'}`}>{a.name}</p>
              <p className="text-[10px] text-muted">{a.desc}</p>
              {!a.unlocked && a.progress !== undefined && (
                <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full" style={{ width: `${(a.progress / 30) * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invitations */}
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Tus invitaciones</h2>
      <div className="bg-white border border-accent/15 rounded-2xl p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold">Invitaciones disponibles</p>
            <p className="text-xs text-muted mt-0.5">Elige bien. Solo tienes 5.</p>
          </div>
          <p className="text-2xl font-extrabold text-accent">3 <span className="text-sm text-muted font-normal">/ 5</span></p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-xs text-muted font-mono truncate">
            nivel.app/i/JAV-X8K2
          </div>
          <motion.button
            onClick={copyLink}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              copied ? 'bg-success/10 text-success' : 'bg-accent text-white'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
          </motion.button>
        </div>
      </div>

      {/* Earn more */}
      <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
        <p className="text-sm font-bold mb-3">Gana más invitaciones</p>
        <div className="space-y-2.5">
          {[
            { action: 'Racha de 30 días', reward: '+2', progress: 14, total: 30, done: false },
            { action: 'Ganar 3 duelos', reward: '+1', progress: 2, total: 3, done: false },
            { action: 'Squad en top 10%', reward: '+1', progress: 1, total: 1, done: true },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${item.done ? 'bg-success-bg' : 'bg-surface'}`}>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">{item.action}</p>
                  <span className={`text-[10px] font-bold ${item.done ? 'text-success' : 'text-accent'}`}>
                    {item.done ? 'Conseguido' : item.reward}
                  </span>
                </div>
                {!item.done && (
                  <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-accent/40 rounded-full" style={{ width: `${(item.progress / item.total) * 100}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Ajustes</h2>
      <div className="bg-white border border-border rounded-xl divide-y divide-border mb-6 shadow-sm">
        {[
          { label: 'Notificaciones de squad', desc: 'Recibe kudos y actividad', enabled: true },
          { label: 'Recordatorios diarios', desc: 'A las 9:00 y 21:00', enabled: true },
          { label: 'Perfil público', desc: 'Visible en rankings globales', enabled: false },
        ].map((setting, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm">{setting.label}</p>
              <p className="text-[10px] text-muted">{setting.desc}</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${setting.enabled ? 'bg-accent' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl border border-border text-muted text-sm font-medium hover:text-red-500 hover:border-red-200 transition mb-8"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </Link>

      <div className="text-center pb-4">
        <Logo size="sm" />
        <p className="text-[10px] text-muted mt-1">v0.1.0</p>
      </div>
    </div>
  )
}
