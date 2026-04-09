'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Heart, Swords, UserPlus } from 'lucide-react'
import { ComparisonBars } from '@/components/charts'

const MEMBERS = [
  { pos: 1, name: 'Carlos', initials: 'CA', pts: 1240, change: 0 },
  { pos: 2, name: 'María', initials: 'MA', pts: 980, change: 1 },
  { pos: 3, name: 'Tú', initials: 'JA', pts: 850, change: -1, isYou: true },
  { pos: 4, name: 'David', initials: 'DA', pts: 320, change: 0, isLast: true },
]

const FEED = [
  { text: 'David no ha ido al gym hoy. Tercer día seguido.', time: 'Hace 2h', type: 'alert' as const },
  { text: 'Carlos completó todos sus hábitos 5 días seguidos', time: 'Hace 3h', type: 'kudos' as const },
  { text: 'María desbloqueó "Monje" — 30 días sin alcohol', time: 'Ayer', type: 'achievement' as const },
  { text: 'Tú ganaste el duelo contra Carlos: +200 bonus', time: 'Hace 2 días', type: 'kudos' as const },
]

const DUELS = [
  { challenger: 'María', challenge: '¿Quién corre más km?', stake: '1 cerveza', status: 'active' as const, you: '12km', them: '8km' },
  { challenger: 'Carlos', challenge: 'Más días de gym esta semana', stake: 'Pagar las cañas', status: 'pending' as const },
]

export default function SquadPage() {
  const [tab, setTab] = useState<'ranking' | 'feed' | 'duels'>('ranking')

  return (
    <div className="pt-14 px-5">
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Squad</p>
            <h1 className="text-xl font-bold">Los Disciplinados</h1>
          </div>
          <div className="flex -space-x-2">
            {MEMBERS.map((m, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                {m.initials}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted mt-1">Semana 14 · Top 8% global</p>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 border border-border shadow-sm mb-5">
        {[
          { id: 'ranking' as const, label: 'Ranking' },
          { id: 'feed' as const, label: 'Feed' },
          { id: 'duels' as const, label: 'Duelos' },
        ].map((t) => (
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
            <div className="bg-white border border-border rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <p className="text-xs font-bold">Reto semanal: 5 sesiones de gym</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '40%' }} />
                </div>
                <span className="text-[10px] text-muted tabular-nums">2/5</span>
              </div>
            </div>

            <div className="space-y-2">
              {MEMBERS.map((m, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border shadow-sm ${
                    m.isYou ? 'bg-accent/[0.04] border-accent/15' : m.isLast ? 'bg-white border-border' : 'bg-white border-border'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-xs font-bold text-muted w-4 text-center tabular-nums">{m.pos}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {m.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-semibold ${m.isYou ? 'text-accent' : ''}`}>{m.name}</p>
                      {m.change !== 0 && (
                        <span className={`text-[10px] font-bold ${m.change > 0 ? 'text-success' : 'text-muted'}`}>
                          {m.change > 0 ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                    {m.isLast && <p className="text-[10px] text-muted">Invita a las cañas</p>}
                  </div>
                  <span className="text-sm font-bold text-muted tabular-nums">{m.pts.toLocaleString()}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white border border-border rounded-xl p-4 mt-4 shadow-sm">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Esta semana</p>
              <ComparisonBars members={MEMBERS.map(m => ({ name: m.name, pts: m.pts, isYou: m.isYou }))} />
            </div>

            <motion.button
              className="w-full mt-4 py-3.5 rounded-xl border border-dashed border-border text-sm text-muted hover:text-accent hover:border-accent/30 transition flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus className="w-4 h-4" /> Invitar al squad
            </motion.button>
          </motion.div>
        )}

        {tab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="space-y-2">
              {FEED.map((item, i) => (
                <motion.div
                  key={i}
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
            <div className="space-y-3">
              {DUELS.map((d, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Swords className="w-3.5 h-3.5 text-accent" />
                      <p className="text-xs font-bold">vs {d.challenger}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      d.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-muted'
                    }`}>
                      {d.status === 'active' ? 'En curso' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{d.challenge}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted">En juego: <span className="text-accent font-medium">{d.stake}</span></p>
                    {d.status === 'active' && d.you && d.them && (
                      <p className="text-[10px] text-muted tabular-nums">
                        Tú <span className="text-accent font-bold">{d.you}</span> vs <span className="font-bold">{d.them}</span>
                      </p>
                    )}
                  </div>
                  {d.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <motion.button className="flex-1 py-2 rounded-lg bg-accent text-white text-xs font-bold" whileTap={{ scale: 0.95 }}>
                        Aceptar
                      </motion.button>
                      <button className="flex-1 py-2 rounded-lg border border-border text-xs text-muted">Rechazar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <motion.button
              className="w-full mt-4 py-3.5 rounded-xl bg-white border border-border text-sm text-muted font-semibold hover:border-accent/20 hover:text-accent transition shadow-sm flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <Swords className="w-4 h-4" /> Retar a alguien
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
