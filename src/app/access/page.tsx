'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo, SPRING } from '@/components/shared'
import { Lock, Mail, ArrowLeft, Flame, Check, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Logo size="lg" />
      </main>
    }>
      <AccessContent />
    </Suspense>
  )
}

type Step = 'invite' | 'email' | 'done' | 'waitlist' | 'waitlist-done'

function AccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const startOnWaitlist = searchParams.get('waitlist') === '1'

  const [step, setStep] = useState<Step>(startOnWaitlist ? 'waitlist' : 'invite')
  const [inviteCode, setInviteCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [invitedBy, setInvitedBy] = useState('')
  const [isFounding, setIsFounding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invitationId, setInvitationId] = useState<string | null>(null)

  const supabase = createClient()

  const handleInviteCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = inviteCode.trim().toUpperCase()
    if (code.length < 4) { setError('Código inválido'); return }

    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('invitations')
      .select('id, owner_id, profiles!invitations_owner_id_fkey(display_name, username)')
      .eq('code', code)
      .is('used_by', null)
      .single()

    setLoading(false)

    if (err || !data) {
      setError('Código inválido o ya utilizado')
      return
    }

    setInvitationId(data.id)
    const ownerProfile = data.profiles as unknown as { display_name: string | null; username: string | null }
    const ownerName = ownerProfile?.display_name || ownerProfile?.username || 'Un miembro de NIVEL'
    setInvitedBy(ownerName)

    if (code === 'FOUNDING') setIsFounding(true)
    setStep('email')
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) { setError('Email inválido'); return }

    setLoading(true)
    setError('')

    const password = crypto.randomUUID()

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpErr) {
      if (signUpErr.message?.includes('already registered')) {
        const { error: otpErr } = await supabase.auth.signInWithOtp({ email })
        if (otpErr) {
          setError('Error al enviar enlace de acceso')
          setLoading(false)
          return
        }
        setError('')
        setLoading(false)
        setStep('done')
        return
      }
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    if (signUpData.session && invitationId) {
      await supabase
        .from('invitations')
        .update({ used_by: signUpData.user!.id, used_at: new Date().toISOString() })
        .eq('id', invitationId)
    }

    setLoading(false)

    if (signUpData.session) {
      router.push('/app/onboarding')
    } else {
      setStep('done')
    }
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) { setError('Email inválido'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('waitlist')
      .insert({ email })

    setLoading(false)

    if (err) {
      if (err.code === '23505') { setError('Ya estás en la lista'); return }
      setError('Error al guardar')
      return
    }

    setStep('waitlist-done')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) { setError('Email inválido'); return }

    setLoading(true)
    setError('')

    const { error: otpErr } = await supabase.auth.signInWithOtp({ email })
    if (otpErr) {
      setError('Error al enviar enlace')
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('done')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 relative bg-white">
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-muted hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {step !== 'waitlist' && step !== 'waitlist-done' && (
        <div className="flex items-center gap-2 mb-8">
          {['invite', 'email', 'done'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition ${
                step === s ? 'bg-accent' : i < ['invite', 'email', 'done'].indexOf(step) ? 'bg-success' : 'bg-gray-200'
              }`} />
              {i < 2 && <div className={`w-6 h-px ${i < ['invite', 'email', 'done'].indexOf(step) ? 'bg-success' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-sm relative min-h-[280px]">
        <AnimatePresence mode="wait">
          {step === 'invite' && (
            <motion.form
              key="invite"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRING}
              onSubmit={handleInviteCode}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <p className="text-base font-semibold">¿Tienes código de invitación?</p>
                <p className="text-xs text-muted mt-1">Alguien de dentro tiene que invitarte</p>
              </div>

              <input
                type="text"
                value={inviteCode}
                onChange={(e) => { setInviteCode(e.target.value); setError('') }}
                placeholder="Pega tu código aquí"
                className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-center text-base font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:border-accent/40 transition uppercase"
                autoFocus
                autoComplete="off"
              />

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar código'}
              </motion.button>

              <button
                type="button"
                onClick={() => { setStep('waitlist'); setError('') }}
                className="w-full text-center text-[11px] text-gray-400 hover:text-muted transition mt-2"
              >
                No tengo invitación
              </button>
            </motion.form>
          )}

          {step === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRING}
              onSubmit={handleEmail}
              className="space-y-4"
            >
              <motion.div
                className="text-center mb-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING, delay: 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-success" />
                </div>
                <p className="text-base font-semibold">Código válido</p>
                <p className="text-xs text-muted mt-1">Invitado por <span className="text-foreground font-medium">{invitedBy}</span></p>
                {isFounding && (
                  <motion.div
                    className="inline-flex items-center gap-1.5 mt-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING, delay: 0.3 }}
                  >
                    <Flame className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-accent font-bold">FOUNDING MEMBER</span>
                  </motion.div>
                )}
              </motion.div>

              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-center text-base placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                autoFocus
                autoComplete="email"
                enterKeyHint="send"
              />

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear cuenta'}
              </motion.button>

              <button type="button" onClick={() => setStep('invite')} className="w-full text-center text-xs text-muted hover:text-foreground transition">
                Cambiar código de invitación
              </button>
            </motion.form>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-xl font-bold">Revisa tu email</h2>
              <p className="text-sm text-muted">
                Hemos enviado un enlace a <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-xs text-muted">Haz click en el enlace para entrar.</p>
            </motion.div>
          )}

          {step === 'waitlist' && (
            <motion.form
              key="waitlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRING}
              onSubmit={handleWaitlist}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-muted" />
                </div>
                <p className="text-base font-semibold">Lista de espera</p>
                <p className="text-xs text-muted mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Deja tu email. Si alguien de dentro te invita o abrimos plazas, serás el primero en saberlo.
                </p>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-center text-base placeholder-gray-400 focus:outline-none focus:border-accent/40 transition"
                autoFocus
                autoComplete="email"
                enterKeyHint="send"
              />

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Avisadme'}
              </motion.button>

              <button
                type="button"
                onClick={() => { setStep('invite'); setError('') }}
                className="w-full text-center text-xs text-accent hover:underline transition"
              >
                Tengo un código de invitación
              </button>
            </motion.form>
          )}

          {step === 'waitlist-done' && (
            <motion.div
              key="waitlist-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold">Estás en la lista</h2>
              <p className="text-sm text-muted max-w-[280px] mx-auto leading-relaxed">
                Te avisaremos en <span className="text-foreground font-medium">{email}</span> en cuanto haya sitio.
              </p>
              <p className="text-xs text-muted">
                La forma más rápida de entrar: pídele a alguien de dentro que te invite.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground transition"
              >
                Volver
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step === 'invite' && (
        <p className="mt-12 text-xs text-muted text-center">
          Solo puedes entrar con una invitación.{' '}
          <Link href="/" className="text-accent hover:underline">Volver</Link>
        </p>
      )}

      {step === 'waitlist' && (
        <p className="mt-12 text-[11px] text-gray-400 text-center max-w-[240px] leading-relaxed">
          NIVEL funciona por invitación. La lista de espera no garantiza acceso.
        </p>
      )}
    </main>
  )
}
