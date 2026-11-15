// Web Audio API procedural sound synthesizer for NASA spacecraft interface
class SoundEngine {
  constructor() {
    this.ctx = null
    this.muted = false
    this.alarmOsc = null
    this.alarmGain = null
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (muted && this.alarmGain) {
      this.stopAlarm()
    }
  }

  playClick() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.04)
  }

  playIgnite() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    // Noise buffer for whoosh
    const bufferSize = this.ctx.sampleRate * 0.4
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(220, this.ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4)
    filter.Q.value = 3.0

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)
    noise.start()
  }

  playExtinguish() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    // Hissing high-pressure gas burst
    const bufferSize = this.ctx.sampleRate * 0.6
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(1800, this.ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.6)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)
    noise.start()
  }

  startAlarm() {
    if (this.muted || this.alarmOsc) return
    this.init()
    if (!this.ctx) return

    this.alarmOsc = this.ctx.createOscillator()
    this.alarmGain = this.ctx.createGain()
    this.alarmOsc.type = 'sawtooth'

    // NASA Master Alarm warble: alternating between 800Hz and 1050Hz
    const now = this.ctx.currentTime
    for (let i = 0; i < 20; i++) {
      this.alarmOsc.frequency.setValueAtTime(950, now + i * 0.3)
      this.alarmOsc.frequency.setValueAtTime(750, now + i * 0.3 + 0.15)
    }

    this.alarmGain.gain.setValueAtTime(0.05, now)
    this.alarmOsc.connect(this.alarmGain)
    this.alarmGain.connect(this.ctx.destination)
    this.alarmOsc.start()
  }

  stopAlarm() {
    if (this.alarmOsc) {
      try {
        this.alarmOsc.stop()
        this.alarmOsc.disconnect()
      } catch (e) {
        // already stopped
      }
      this.alarmOsc = null
      this.alarmGain = null
    }
  }
}

export const sound = new SoundEngine()
