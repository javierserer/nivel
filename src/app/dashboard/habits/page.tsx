'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Flame, TrendingUp, Loader2 } from 'lucide-react'
import { MiniHeatmap } from '@/components/charts'
import { createClient } from '@/lib/supabase/client'

interface Habit {
  id: string
  name: string
  pts: number
  difficulty: string
  frequency: string
  active: boolean
  created_at: string
  streak?: number
  completion_rate?: number
}

const DIFFICULTIES = [
  { id: 'easy', label: 'Fácil', pts: 15, desc: 'Beber agua, estirar, vitaminas...' },
  { id: 'normal', label: 'Normal', pts: 30, desc: 'Leer, meditar, cocinar...' },
  { id: 'hard', label: 'Difícil', pts: 50, desc: 'Gym, correr, madrugar...' },
  { id: 'beast', label: 'Bestia', pts: 80, desc: 'Ayuno, cold shower, doble sesión...' },
]

const POPULAR = [
  { name: 'Cold shower', diff: 'Bestia', pts: 80 },
  { name: 'Journaling', diff: 'Normal', pts: 30 },
  { name: 'No pantallas antes de dormir', diff: 'Normal', pts: 30 },
  { name: 'Caminar 10k pasos', diff: 'Difícil', pts: 50 },
  { name: 'Ayuno 16h', diff: 'Bestia', pts: 80 },
  { name: 'Estiramientos', diff: 'Fácil', pts: 15 },
]

export default function HabitsPage() {
  const supabase = createClient()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDifficulty, setNewDifficulty] = useState('')
  const [newFrequency, setNewFrequency] = useState('Diario')
  const [saving, setSaving] = useState(false)

  const fetchHabits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed, log_date')
        .eq('user_id', user.id)
        .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])

      const enriched = data.map(h => {
        const habitLogs = logs?.filter(l => l.habit_id === h.id) || []
        const completed = habitLogs.filter(l => l.completed).length
        const total = Math.max(habitLogs.length, 1)
        return {
          ...h,
          completion_rate: Math.round((completed / total) * 100),
          streak: 0,
        }
      })

      setHabits(enriched)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleActive = async (id: string, currentActive: boolean) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, active: !h.active } : h))
    await supabase.from('habits').update({ active: !currentActive }).eq('id', id)
  }

  const addHabit = async () => {
    if (!newName.trim() || !newDifficulty) return
    const diff = DIFFICULTIES.find(d => d.id === newDifficulty)
    if (!diff) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        difficulty: newDifficulty,
        pts: diff.pts,
        frequency: newFrequency,
      })
      .select()
      .single()

    if (data) {
      setHabits(prev => [{ ...data, completion_rate: 0, streak: 0 }, ...prev])
    }

    setNewName('')
    setNewDifficulty('')
    setNewFrequency('Diario')
    setShowAdd(false)
    setSaving(false)
  }

  const activeHabits = habits.filter(h => h.active)
  const inactiveHabits = habits.filter(h => !h.active)
  const totalDaily = activeHabits.reduce((s, h) => s + h.pts, 0)

  if (loading) {
    return (
      <div className="pt-14 px-5 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mt-20" />
      </div>
    )
  }

  return (
    <div className="pt-14 px-5">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Hábitos</h1>
        <motion.button
          onClick={() => setShowAdd(!showAdd)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-sm ${
            showAdd ? 'bg-gray-100 text-gray-600' : 'bg-white border border-border text-muted'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.button>
      </div>
      <p className="text-xs text-muted mb-5">
        {activeHabits.length} activos · Potencial diario: <span className="text-accent font-semibold">{totalDaily} pts</span>
      </p>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold mb-4">Nuevo hábito</p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre (ej: No-fap, Yoga, Journaling...)"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition mb-3"
                autoFocus
              />
              <p className="text-xs text-muted mb-2">Frecuencia</p>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['Diario', '3x semana', '2x semana', '1x semana'].map(f => (
                  <button
                    key={f}
                    onClick={() => setNewFrequency(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                      newFrequency === f ? 'bg-accent/10 border-accent/20 text-accent' : 'border-border text-muted'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mb-2">Dificultad (determina los puntos)</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setNewDifficulty(d.id)}
                    className={`px-3 py-3 rounded-xl text-left transition border ${
                      newDifficulty === d.id ? 'bg-accent/5 border-accent/30' : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold">{d.label}</span>
                      <span className="text-xs font-bold text-accent">+{d.pts}</span>
                    </div>
                    <p className="text-[10px] text-muted leading-relaxed">{d.desc}</p>
                  </button>
                ))}
              </div>
              <motion.button
                onClick={addHabit}
                disabled={!newName.trim() || !newDifficulty || saving}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-20 transition flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Añadir hábito'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Activos</p>
        {activeHabits.length === 0 && (
          <p className="text-sm text-muted text-center py-8">Aún no tienes hábitos. ¡Añade el primero!</p>
        )}
        <div className="space-y-2">
          {activeHabits.map(h => (
            <motion.div key={h.id} className="bg-white border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm" layout>
              <MiniHeatmap completionRate={h.completion_rate || 0} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate">{h.name}</p>
                  {(h.streak ?? 0) > 0 && (
                    <span className="text-[10px] text-accent font-bold flex items-center gap-0.5 shrink-0">
                      <Flame className="w-2.5 h-2.5" /> {h.streak}d
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span>{h.frequency}</span>
                  <span>·</span>
                  <span className="text-accent font-semibold">+{h.pts}</span>
                  <span>·</span>
                  <span>{h.completion_rate || 0}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full transition-all" style={{ width: `${h.completion_rate || 0}%` }} />
                </div>
              </div>
              <button
                onClick={() => toggleActive(h.id, h.active)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-red-400 hover:border-red-300 transition shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {inactiveHabits.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">Pausados</p>
          <div className="space-y-2">
            {inactiveHabits.map(h => (
              <div key={h.id} className="bg-white/50 border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <div className="flex-1">
                  <p className="text-sm text-muted">{h.name}</p>
                  <p className="text-[10px] text-muted">{h.frequency} · +{h.pts}</p>
                </div>
                <motion.button
                  onClick={() => toggleActive(h.id, h.active)}
                  className="px-3 py-1.5 rounded-lg border border-accent/20 text-[10px] text-accent font-semibold"
                  whileTap={{ scale: 0.95 }}
                >
                  Activar
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Populares en NIVEL</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {POPULAR.map((p, i) => (
            <motion.button
              key={i}
              className="shrink-0 w-[140px] bg-white border border-border rounded-xl p-3 text-left shadow-sm hover:border-accent/20 transition"
              whileTap={{ scale: 0.97 }}
              onClick={() => { setNewName(p.name); setShowAdd(true) }}
            >
              <p className="text-xs font-semibold truncate mb-1">{p.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted">
                <span className="text-accent font-bold">+{p.pts}</span>
                <span>·</span>
                <span>{p.diff}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
