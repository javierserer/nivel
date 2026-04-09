'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo, SPRING } from '@/components/shared'
import { Camera, ArrowRight, Check, Users, Plus, Loader2 } from 'lucide-react'

const POPULAR_HABITS = [
  { name: 'Gym 1h', difficulty: 'hard' as const, pts: 50 },
  { name: 'Leer 30min', difficulty: 'normal' as const, pts: 30 },
  { name: 'Meditar 10min', difficulty: 'easy' as const, pts: 15 },
  { name: 'Sin alcohol', difficulty: 'normal' as const, pts: 30 },
  { name: 'Madrugar', difficulty: 'hard' as const, pts: 50 },
  { name: 'Cold shower', difficulty: 'beast' as const, pts: 80 },
  { name: 'Journaling', difficulty: 'normal' as const, pts: 30 },
  { name: 'Caminar 10k pasos', difficulty: 'hard' as const, pts: 50 },
  { name: 'Estiramientos', difficulty: 'easy' as const, pts: 15 },
  { name: 'Ayuno 16h', difficulty: 'beast' as const, pts: 80 },
  { name: 'No pantallas antes de dormir', difficulty: 'normal' as const, pts: 30 },
  { name: 'Cocinar en casa', difficulty: 'normal' as const, pts: 30 },
]

const DIFF_LABELS: Record<string, string> = {
  easy: 'Fácil', normal: 'Normal', hard: 'Difícil', beast: 'Bestia',
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Step 2
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set())
  const [customHabit, setCustomHabit] = useState('')

  // Step 3
  const [squadOption, setSquadOption] = useState<'create' | 'join' | null>(null)
  const [squadName, setSquadName] = useState('')
  const [squadCode, setSquadCode] = useState('')
  const [error, setError] = useState('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      canvas.width = 256
      canvas.height = 256
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256)
      canvas.toBlob((blob) => {
        if (blob) {
          setAvatarFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
          setAvatarPreview(canvas.toDataURL('image/jpeg'))
        }
      }, 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  }

  const toggleHabit = (name: string) => {
    setSelectedHabits(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const addCustomHabit = () => {
    if (customHabit.trim()) {
      setSelectedHabits(prev => new Set(prev).add(customHabit.trim()))
      setCustomHabit('')
    }
  }

  const handleStep1 = async () => {
    if (!displayName.trim()) { setError('Ponle un nombre'); return }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada — recarga la página'); setLoading(false); return }

    let avatar_url: string | null = null
    if (avatarFile) {
      const path = `${user.id}/avatar.jpg`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadErr) {
        setError('Error subiendo foto: ' + uploadErr.message)
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      avatar_url = urlData.publicUrl
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || displayName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')

    const updates: Record<string, string> = {
      display_name: displayName.trim(),
      username: cleanUsername,
    }
    if (avatar_url) updates.avatar_url = avatar_url

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateErr) {
      setError('Error guardando perfil: ' + updateErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async () => {
    if (selectedHabits.size === 0) { setError('Elige al menos un hábito'); return }
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const habitsToInsert = Array.from(selectedHabits).map(name => {
      const popular = POPULAR_HABITS.find(h => h.name === name)
      return {
        user_id: user.id,
        name,
        difficulty: popular?.difficulty || 'normal',
        pts: popular?.pts || 30,
        frequency: 'Diario',
      }
    })

    const { error: insertErr } = await supabase.from('habits').insert(habitsToInsert)

    if (insertErr) {
      setError('Error guardando hábitos: ' + insertErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(3)
  }

  const handleFinish = async () => {
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (squadOption === 'create' && squadName.trim()) {
      const squadId = crypto.randomUUID()
      const { error: squadErr } = await supabase
        .from('squads')
        .insert({ id: squadId, name: squadName.trim(), created_by: user.id })

      if (squadErr) {
        setError('Error creando squad: ' + squadErr.message)
        setLoading(false)
        return
      }

      const { error: memberErr } = await supabase
        .from('squad_members')
        .insert({ squad_id: squadId, user_id: user.id, role: 'owner' })

      if (memberErr) {
        setError('Error uniéndote al squad: ' + memberErr.message)
        setLoading(false)
        return
      }
    } else if (squadOption === 'join' && squadCode.trim()) {
      const { data: squad, error: findErr } = await supabase
        .from('squads')
        .select('id')
        .eq('invite_code', squadCode.trim().toUpperCase())
        .single()

      if (findErr || !squad) {
        setError('Código de squad no encontrado')
        setLoading(false)
        return
      }

      const { error: joinErr } = await supabase
        .from('squad_members')
        .insert({ squad_id: squad.id, user_id: user.id })

      if (joinErr) {
        setError('Error uniéndote al squad: ' + joinErr.message)
        setLoading(false)
        return
      }
    }

    const { error: doneErr } = await supabase
      .from('profiles')
      .update({ onboarding_done: true })
      .eq('id', user.id)

    if (doneErr) {
      setError('Error finalizando: ' + doneErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
      <div className="mb-6">
        <Logo size="md" />
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
              step === s ? 'bg-accent' : step > s ? 'bg-success' : 'bg-gray-200'
            }`} />
            {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-success' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={SPRING}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold">Tu perfil</h2>
                <p className="text-sm text-muted mt-1">Para que tu squad te reconozca</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl bg-surface border-2 border-dashed border-border hover:border-accent/40 transition flex items-center justify-center overflow-hidden"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-muted text-center -mt-3">Opcional</p>

              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                  autoFocus
                />
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3.5 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                  />
                </div>
                <p className="text-[10px] text-muted mt-1">Opcional — se genera automáticamente si no lo pones</p>
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                onClick={handleStep1}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Siguiente <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={SPRING}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold">Elige tus hábitos</h2>
                <p className="text-sm text-muted mt-1">Mínimo 1 — puedes añadir más después</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_HABITS.map(h => {
                  const selected = selectedHabits.has(h.name)
                  return (
                    <motion.button
                      key={h.name}
                      onClick={() => toggleHabit(h.name)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                        selected
                          ? 'bg-accent/10 border-accent/30 text-accent'
                          : 'border-border text-muted hover:border-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      {h.name}
                      <span className="ml-1.5 text-[10px] opacity-60">+{h.pts}</span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHabit}
                  onChange={e => setCustomHabit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomHabit())}
                  placeholder="Crear hábito personalizado..."
                  className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                />
                <motion.button
                  onClick={addCustomHabit}
                  className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 transition"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              {selectedHabits.size > 0 && (
                <p className="text-xs text-accent font-semibold text-center">
                  {selectedHabits.size} hábito{selectedHabits.size > 1 ? 's' : ''} seleccionado{selectedHabits.size > 1 ? 's' : ''}
                </p>
              )}

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                onClick={handleStep2}
                disabled={loading || selectedHabits.size === 0}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Siguiente <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={SPRING}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold">Tu squad</h2>
                <p className="text-sm text-muted mt-1">Compite con amigos — puedes hacerlo después</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => { setSquadOption('create'); setError('') }}
                  className={`p-4 rounded-xl border text-left transition ${
                    squadOption === 'create' ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-gray-300'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <Users className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-semibold">Crear squad</p>
                  <p className="text-[10px] text-muted mt-0.5">Nuevo equipo</p>
                </motion.button>

                <motion.button
                  onClick={() => { setSquadOption('join'); setError('') }}
                  className={`p-4 rounded-xl border text-left transition ${
                    squadOption === 'join' ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-gray-300'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <ArrowRight className="w-5 h-5 text-accent mb-2" />
                  <p className="text-sm font-semibold">Unirme</p>
                  <p className="text-[10px] text-muted mt-0.5">Tengo un código</p>
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {squadOption === 'create' && (
                  <motion.div key="create" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <input
                      type="text"
                      value={squadName}
                      onChange={e => setSquadName(e.target.value)}
                      placeholder="Nombre del squad (ej: Los Invencibles)"
                      className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                      autoFocus
                    />
                  </motion.div>
                )}
                {squadOption === 'join' && (
                  <motion.div key="join" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <input
                      type="text"
                      value={squadCode}
                      onChange={e => setSquadCode(e.target.value)}
                      placeholder="Código del squad"
                      className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-center font-mono tracking-widest text-sm placeholder-gray-400 focus:outline-none focus:border-accent/40 transition uppercase"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                onClick={handleFinish}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Empezar'}
              </motion.button>

              <button
                onClick={handleFinish}
                className="w-full text-center text-xs text-muted hover:text-foreground transition"
              >
                Saltar por ahora
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
