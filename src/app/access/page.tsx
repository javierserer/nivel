'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/shared'

const SPRING = { type: 'spring' as const, stiffness: 200, damping: 22 }

const VALID_CODES = ['FOUNDING', 'DOSIS1', 'INVITE']
const FOUNDING_CODES = ['FOUNDING']

type Step = 'invite' | 'phone' | 'otp'

export default function AccessPage() {
  const [step, setStep] = useState<Step>('invite')
  const [inviteCode, setInviteCode] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFounding, setIsFounding] = useState(false)
  const [invitedBy, setInvitedBy] = useState('')
  const router = useRouter()

  const handleInviteCode = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const code = inviteCode.toUpperCase().trim()
    if (code.length < 4) {
      setError('Código demasiado corto')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))

    // Mock validation: accept any 6+ char code, or special codes
    if (code.length >= 6 || VALID_CODES.includes(code)) {
      if (FOUNDING_CODES.includes(code)) setIsFounding(true)
      setInvitedBy(code.length >= 6 ? 'Carlos' : 'Founding Team')
      setLoading(false)
      setStep('phone')
    } else {
      setError('Código no válido. Necesitas que alguien te invite.')
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 9) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setStep('otp')
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    router.push('/app')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 relative bg-background">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-gold/[0.06] to-transparent blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <Logo size="lg" />
        <p className="text-sm text-neutral-500 mt-2">Solo por invitación</p>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="flex items-center gap-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {['invite', 'phone', 'otp'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                step === s
                  ? 'bg-gold w-6'
                  : i < ['invite', 'phone', 'otp'].indexOf(step)
                  ? 'bg-gold'
                  : 'bg-neutral-700'
              } rounded-full`}
            />
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <div className="w-full max-w-sm relative min-h-[280px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Invite Code */}
          {step === 'invite' && (
            <motion.form
              key="invite"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={SPRING}
              onSubmit={handleInviteCode}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl mx-auto mb-3">
                  🔒
                </div>
                <p className="text-base font-semibold text-white">¿Tienes código de invitación?</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Alguien de dentro tiene que invitarte
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  autoFocus
                  placeholder="CÓDIGO DE INVITACIÓN"
                  className="w-full text-center text-lg tracking-widest font-mono px-4 py-4 bg-card border border-border rounded-xl text-white placeholder-neutral-700 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition uppercase"
                  maxLength={12}
                />
                {error && (
                  <motion.p
                    className="text-xs text-red-400 text-center mt-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || inviteCode.length < 4}
                className="w-full py-3.5 rounded-xl bg-gold text-black font-bold text-base disabled:opacity-30 transition"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Spinner /> : 'Verificar código'}
              </motion.button>

              <a href="/" className="block text-center text-xs text-neutral-600 hover:text-neutral-400 transition mt-2">
                ← Volver a la página principal
              </a>
            </motion.form>
          )}

          {/* Step 2: Phone */}
          {step === 'phone' && (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={SPRING}
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              {/* Welcome message */}
              <motion.div
                className="text-center mb-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING, delay: 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mx-auto mb-3">
                  ✓
                </div>
                <p className="text-base font-semibold text-emerald-400">¡Código válido!</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Invitado por <span className="text-white font-medium">{invitedBy}</span>
                </p>
                {isFounding && (
                  <motion.div
                    className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mt-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                  >
                    <span className="text-xs">🏅</span>
                    <span className="text-[10px] text-gold font-bold">FOUNDING MEMBER</span>
                  </motion.div>
                )}
              </motion.div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">Tu número de teléfono</label>
                <div className="flex gap-2">
                  <div className="px-3.5 py-3 bg-card border border-border rounded-xl text-sm text-neutral-400 flex items-center">
                    +34
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    placeholder="612 345 678"
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition text-base"
                    maxLength={9}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || phone.length < 9}
                className="w-full py-3.5 rounded-xl bg-gold text-black font-bold text-base disabled:opacity-30 transition"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Spinner /> : 'Continuar'}
              </motion.button>
            </motion.form>
          )}

          {/* Step 3: OTP */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={SPRING}
              onSubmit={handleVerify}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl mx-auto mb-3">
                  📱
                </div>
                <p className="text-sm text-neutral-400">Código enviado a</p>
                <p className="text-sm text-white font-semibold">+34 {phone}</p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.4em] font-mono px-4 py-4 bg-card border border-border rounded-xl text-white placeholder-neutral-700 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition"
              />

              <motion.button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-gold text-black font-bold text-base disabled:opacity-30 transition"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? <Spinner /> : 'Entrar en DOSIS'}
              </motion.button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp('') }}
                  className="text-neutral-500 hover:text-white transition"
                >
                  ← Cambiar número
                </button>
                <button type="button" className="text-gold hover:text-gold-light transition">
                  Reenviar código
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info */}
      <motion.p
        className="absolute bottom-6 text-[11px] text-neutral-700 text-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Solo puedes entrar con una invitación.{' '}
        <a href="/" className="text-neutral-500 hover:text-neutral-300 transition underline">
          Volver
        </a>
      </motion.p>
    </main>
  )
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <motion.span
        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
      />
    </span>
  )
}
