'use client'

let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return _ctx
}

function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('inside_sound_enabled') !== 'false'
}

function isMusicEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('inside_music_enabled') !== 'false'
}

export function playDing() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08)
  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.start(); osc.stop(ctx.currentTime + 0.4)
}

export function playCountdownBeep(isLast: boolean) {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.value = isLast ? 1320 : 660
  gain.gain.setValueAtTime(0.20, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.start(); osc.stop(ctx.currentTime + 0.15)
}

export function playWhoosh() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * 0.4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(200, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.3)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  source.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
  source.start(); source.stop(ctx.currentTime + 0.4)
}

export function playFanfare() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    const t = ctx.currentTime + i * 0.12
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.22, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
    osc.start(t); osc.stop(t + 0.6)
  })
}

export function playReveal() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  // Ascending two-note reveal sound
  const freqs = [440, 660]
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = ctx.currentTime + i * 0.1
    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
    osc.start(t); osc.stop(t + 0.5)
  })
}

// NEW: short UI click feedback (very subtle, 60ms)
export function playClick() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = 440
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
  osc.start(); osc.stop(ctx.currentTime + 0.06)
}

// NEW: positive validation (double ding, higher)
export function playSuccess() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  const notes = [880, 1100]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = ctx.currentTime + i * 0.1
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.start(t); osc.stop(t + 0.35)
  })
}

let _musicGain: GainNode | null = null
let _musicRunning = false

export function startAmbientMusic(volume = 0.06) {
  if (!isMusicEnabled()) return
  if (_musicRunning) return
  _musicRunning = true
  const ctx = getCtx()
  _musicGain = ctx.createGain()
  _musicGain.gain.value = volume
  _musicGain.connect(ctx.destination)

  // Low drone: slow LFO on a sub-bass oscillator
  const drone = ctx.createOscillator()
  const droneLFO = ctx.createOscillator()
  const droneDepth = ctx.createGain()
  droneLFO.frequency.value = 0.15
  droneDepth.gain.value = 3
  droneLFO.connect(droneDepth); droneDepth.connect(drone.frequency)
  drone.type = 'sine'
  drone.frequency.value = 55
  drone.connect(_musicGain)
  drone.start()

  // Mid pad: gentle chord tones
  const padFreqs = [220, 277.18, 329.63] // A3, C#4, E4
  padFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const padGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    // Slow breathing effect
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.08 + i * 0.03
    lfoGain.gain.value = 0.4
    lfo.connect(lfoGain); lfoGain.connect(padGain.gain)
    padGain.gain.value = 0.5
    osc.connect(padGain); padGain.connect(_musicGain!)
    lfo.start(); osc.start()
  })

  droneLFO.start()
}

export function stopAmbientMusic() {
  _musicRunning = false
  if (_musicGain) {
    const ctx = getCtx()
    _musicGain.gain.setValueAtTime(_musicGain.gain.value, ctx.currentTime)
    _musicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    setTimeout(() => { _musicGain = null }, 1600)
  }
}

export function setMusicVolume(vol: number) {
  if (_musicGain) _musicGain.gain.value = vol
}
