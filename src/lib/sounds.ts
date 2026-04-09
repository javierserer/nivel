let audioCtx: AudioContext | null = null

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

export function playCompletionSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.setValueAtTime(1320, now + 0.08)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1100, now + 0.06)
    osc2.frequency.setValueAtTime(1760, now + 0.12)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.06)
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.25)
  } catch {
    // Audio not available
  }
}
