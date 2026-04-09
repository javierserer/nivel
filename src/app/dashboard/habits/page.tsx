'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, TrendingUp, Loader2, Pencil, ChevronDown, Search, Zap, Dumbbell, Brain, BookOpen, Moon, Flame, Users, Sparkles, Heart, TreePine, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { searchHabits, CATEGORIES, HABIT_CATALOG, type CatalogHabit } from '@/lib/habit-catalog'

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
  { id: 'easy', label: 'Fácil', pts: 15 },
  { id: 'normal', label: 'Normal', pts: 30 },
  { id: 'hard', label: 'Difícil', pts: 50 },
  { id: 'beast', label: 'Bestia', pts: 80 },
]

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  normal: 'bg-blue-100 text-blue-700',
  hard: 'bg-orange-100 text-orange-700',
  beast: 'bg-red-100 text-red-700',
}

const CAT_ICONS: Record<string, typeof Dumbbell> = {
  Fitness: Dumbbell, Nutrición: Zap, Mental: Brain, Productividad: Flame,
  Aprendizaje: BookOpen, Sueño: Moon, Retos: Sparkles, Social: Users,
  Cuidado: Heart, Finanzas: Wallet, Creatividad: Sparkles, Exterior: TreePine,
}

export default function HabitsPage() {
  const supabase = createClient()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDifficulty, setNewDifficulty] = useState('')
  const [newFrequency, setNewFrequency] = useState('Diario')
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<CatalogHabit[]>([])
  const [browseCategory, setBrowseCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        const habitLogs = logs?.filter(l => l.habit_id === h.id && l.completed) || []
        return {
          ...h,
          completion_rate: Math.round((habitLogs.length / 30) * 100),
          streak: 0,
        }
      })
      setHabits(enriched)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const handleNameChange = (val: string) => {
    setNewName(val)
    setSuggestions(searchHabits(val))
  }

  const pickSuggestion = (s: CatalogHabit) => {
    setNewName(s.name)
    setNewDifficulty(s.difficulty)
    setSuggestions([])
  }

  const pickFromCatalog = (s: CatalogHabit) => {
    setNewName(s.name)
    setNewDifficulty(s.difficulty)
    setBrowseCategory(null)
    setShowAdd(true)
    setSuggestions([])
  }

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
    setSuggestions([])
  }

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const diff = updates.difficulty ? DIFFICULTIES.find(d => d.id === updates.difficulty) : null
    const fullUpdates = diff ? { ...updates, pts: diff.pts } : updates

    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...fullUpdates } : h))
    await supabase.from('habits').update(fullUpdates).eq('id', id)
    setEditId(null)
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
    <div className="pt-14 px-5 pb-28">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">Hábitos</h1>
        <motion.button
          onClick={() => { setShowAdd(!showAdd); setBrowseCategory(null) }}
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
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Busca o escribe un hábito..."
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                  autoFocus
                />
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden"
                    >
                      {suggestions.map((s, i) => {
                        const Icon = CAT_ICONS[s.category] || Sparkles
                        return (
                          <button
                            key={i}
                            onClick={() => pickSuggestion(s)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition text-left"
                          >
                            <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{s.name}</p>
                              <p className="text-[10px] text-muted">{s.category}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFF_COLORS[s.difficulty]}`}>
                              +{s.pts}
                            </span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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

              <p className="text-xs text-muted mb-2">Dificultad</p>
              <div className="flex gap-2 mb-4">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setNewDifficulty(d.id)}
                    className={`flex-1 py-2.5 rounded-xl text-center transition border ${
                      newDifficulty === d.id ? 'bg-accent/5 border-accent/30' : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{d.label}</span>
                    <span className="text-[10px] text-accent font-bold">+{d.pts}</span>
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
            <div key={h.id}>
              <motion.div
                className="bg-white border border-border rounded-xl px-4 py-3.5 shadow-sm"
                layout
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{h.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${DIFF_COLORS[h.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                        {DIFFICULTIES.find(d => d.id === h.difficulty)?.label || h.difficulty}
                      </span>
                      <span>{h.frequency}</span>
                      <span className="text-accent font-semibold">+{h.pts}</span>
                      <span>{Math.min(h.completion_rate || 0, 100)}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-accent/40 rounded-full transition-all" style={{ width: `${Math.min(h.completion_rate || 0, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditId(editId === h.id ? null : h.id)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 transition"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleActive(h.id, h.active)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted hover:text-red-400 hover:border-red-300 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {editId === h.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-surface border border-t-0 border-border rounded-b-xl px-4 py-4 -mt-1 space-y-3">
                      <div>
                        <p className="text-[10px] text-muted mb-1.5 font-medium">Dificultad</p>
                        <div className="flex gap-2">
                          {DIFFICULTIES.map(d => (
                            <button
                              key={d.id}
                              onClick={() => updateHabit(h.id, { difficulty: d.id, pts: d.pts })}
                              className={`flex-1 py-2 rounded-lg text-center transition border text-[11px] font-medium ${
                                h.difficulty === d.id ? 'bg-accent/10 border-accent/30 text-accent' : 'border-border text-muted'
                              }`}
                            >
                              {d.label} · +{d.pts}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted mb-1.5 font-medium">Frecuencia</p>
                        <div className="flex gap-2 flex-wrap">
                          {['Diario', '3x semana', '2x semana', '1x semana'].map(f => (
                            <button
                              key={f}
                              onClick={() => updateHabit(h.id, { frequency: f })}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                                h.frequency === f ? 'bg-accent/10 border-accent/20 text-accent' : 'border-border text-muted'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Explorar hábitos</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide mb-3">
          {CATEGORIES.map(cat => {
            const Icon = CAT_ICONS[cat] || Sparkles
            return (
              <button
                key={cat}
                onClick={() => setBrowseCategory(browseCategory === cat ? null : cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  browseCategory === cat ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white border-border text-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {browseCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5">
                {HABIT_CATALOG.filter(h => h.category === browseCategory).map((h, i) => {
                  const already = habits.some(ex => ex.name.toLowerCase() === h.name.toLowerCase())
                  return (
                    <motion.button
                      key={i}
                      onClick={() => !already && pickFromCatalog(h)}
                      disabled={already}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition ${
                        already ? 'opacity-40 border-border bg-gray-50' : 'bg-white border-border hover:border-accent/20 shadow-sm'
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: already ? 0.4 : 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{h.name}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFF_COLORS[h.difficulty]}`}>
                        +{h.pts}
                      </span>
                      {already && <span className="text-[10px] text-muted">Ya añadido</span>}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
