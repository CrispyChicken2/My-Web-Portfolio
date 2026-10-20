// The Room's sound, synthesised rather than recorded: the content-security
// policy allows no external origin, and noise shaped by a filter is most of
// what a room, a fan and a key switch sound like anyway.
//
//   · room tone — brown noise, muffled more the closer the camera gets;
//   · the computer — a low fan hum, there from the moment the Visitor starts;
//   · switches — a tactile key-down and a lighter key-up, the space bar
//     deeper than the rest; the mouse's two clicks; a soft chime at boot.
//
// Nothing plays until the Visitor presses Start: browsers only allow audio
// that a person set going.

function noiseBuffer(context, seconds, colour) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    if (colour === 'brown') {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    } else {
      data[i] = white
    }
  }
  return buffer
}

export function createAudio() {
  let context = null
  let master = null
  let roomFilter = null
  let roomGain = null
  let white = null
  let muted = false

  const now = () => context.currentTime

  const loop = (buffer, filter, gainValue) => {
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = context.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(gainValue, now() + 2.5)
    source.connect(filter).connect(gain).connect(master)
    source.start()
    return gain
  }

  // A short filtered burst: the click of a switch, the snap of a button.
  const burst = ({ frequency, q = 1.2, gain = 0.3, decay = 0.03, type = 'bandpass', delay = 0 }) => {
    if (!context || muted) return
    const source = context.createBufferSource()
    source.buffer = white
    const filter = context.createBiquadFilter()
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = q
    const envelope = context.createGain()
    const t = now() + delay
    envelope.gain.setValueAtTime(0, t)
    envelope.gain.linearRampToValueAtTime(gain, t + 0.002)
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    source.connect(filter).connect(envelope).connect(master)
    source.start(t, Math.random() * 0.5, decay + 0.05)
  }

  // A pitched thump under the click: the switch bottoming out on the plate.
  const thock = ({ frequency, gain = 0.12, decay = 0.05 }) => {
    if (!context || muted) return
    const osc = context.createOscillator()
    osc.type = 'sine'
    const t = now()
    osc.frequency.setValueAtTime(frequency, t)
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, t + decay)
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(gain, t)
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    osc.connect(envelope).connect(master)
    osc.start(t)
    osc.stop(t + decay + 0.02)
  }

  const tone = (frequency, start, length, gain) => {
    const osc = context.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency
    const envelope = context.createGain()
    const t = now() + start
    envelope.gain.setValueAtTime(0, t)
    envelope.gain.linearRampToValueAtTime(gain, t + 0.04)
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + length)
    osc.connect(envelope).connect(master)
    osc.start(t)
    osc.stop(t + length + 0.05)
  }

  return {
    start() {
      if (context) return
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      context = new AudioContext()
      master = context.createGain()
      master.gain.value = muted ? 0 : 1
      master.connect(context.destination)
      white = noiseBuffer(context, 2, 'white')

      roomFilter = context.createBiquadFilter()
      roomFilter.type = 'lowpass'
      roomFilter.frequency.value = 700
      roomGain = loop(noiseBuffer(context, 6, 'brown'), roomFilter, 0.09)

      const fanFilter = context.createBiquadFilter()
      fanFilter.type = 'bandpass'
      fanFilter.frequency.value = 190
      fanFilter.Q.value = 0.8
      loop(noiseBuffer(context, 4, 'white'), fanFilter, 0.022)
    },

    setMuted(value) {
      muted = value
      if (master) master.gain.setTargetAtTime(value ? 0 : 1, now(), 0.08)
    },

    // 0 when the camera is at the Screen, 1 when it is far away.
    setDistance(amount) {
      if (!roomFilter) return
      roomFilter.frequency.setTargetAtTime(260 + amount * 1100, now(), 0.4)
      roomGain.gain.setTargetAtTime(0.05 + amount * 0.06, now(), 0.4)
    },

    key(code, down) {
      const space = code === 'Space'
      const big = space || code === 'Enter' || code === 'Backspace' || code.startsWith('Shift')
      const detune = 0.85 + Math.random() * 0.3
      if (down) {
        burst({ frequency: (big ? 1700 : 2600) * detune, q: 1.4, gain: big ? 0.32 : 0.26, decay: 0.035 })
        thock({ frequency: (space ? 120 : big ? 160 : 210) * detune, gain: big ? 0.16 : 0.1 })
      } else {
        burst({ frequency: 3600 * detune, q: 2, gain: 0.08, decay: 0.02 })
      }
    },

    // The quiet tick the overlay makes as it types itself out.
    tick() {
      burst({ frequency: 3000 + Math.random() * 600, q: 2.2, gain: 0.06, decay: 0.018 })
    },

    click(down) {
      burst({ frequency: down ? 4200 : 3400, q: 3, gain: down ? 0.22 : 0.12, decay: 0.012, type: 'bandpass' })
    },

    chime() {
      if (!context || muted) return
      tone(523.25, 0, 1.6, 0.05)
      tone(783.99, 0.12, 1.8, 0.04)
      tone(1046.5, 0.3, 2.2, 0.03)
    },
  }
}
