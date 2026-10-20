// The Room's colours. Like the Backdrop's, they are not Tokens: a lit 3D
// scene needs material albedos, light colours and emissive values, none of
// which a CSS custom property can supply to WebGL. They live here, in one
// place, so retheming the Room is still one edit.
//
// The scene is an evening desk: a dark cold room, a pale oak top, a warm
// pool from the monitor light bar, and the cold scale's ice-cyan as the only
// glow — the bias light behind the desk and the Esc and Enter keys. The PC is
// the one exception: its RGB is lavender, every fan, the pump, the memory and
// the graphics card alike.
export const palette = {
  // the PC's RGB
  lavender: '#b9a4ff',
  lavenderDeep: '#8f76f0',

  // the room
  wall: '#2b2f38',
  wallTrim: '#1f222a',
  floor: '#4a3a2e',
  rug: '#2f343d',
  night: '#0b0d14',

  // furniture
  oak: '#c49a6c',
  steel: '#17191e',
  felt: '#24272e',
  shelf: '#d6cfc4',

  // electronics
  bezel: '#0c0d10',
  aluminium: '#a7adb4',
  graphite: '#2b2e34',
  glass: '#9fb3bd',
  pcb: '#121519',

  // keyboard
  keyLight: '#e3e6ea',
  keyMid: '#9aa3ad',
  keyDark: '#363c45',
  keyAccent: '#8fbdc4',
  legendOnLight: '#30353d',
  legendOnDark: '#e6eaee',
  caseTop: '#3a3f47',

  // chair
  fabric: '#1b1d22',
  mesh: '#101115',
  chrome: '#c9ced4',

  // objects
  ceramic: '#ebe7e0',
  haribo: '#f4c21b',
  hariboRed: '#d6262b',
  gummies: ['#e8352f', '#f28a1d', '#f6d21c', '#4fb83b', '#f2ece1', '#c8102e'],
  leaf: '#3d6b4c',
  leafEdge: '#b8c46a',
  pot: '#d8d2c8',
  notebook: '#34404d',
  paper: '#efe9dd',
  books: ['#8fbdc4', '#d6cfc4', '#4b5563', '#a88b6a', '#2f3a47', '#c96f4e'],

  // light
  ice: '#8fbdc4',
  violet: '#8d7dca',
  warm: '#ffd7aa',
  moon: '#93a8d8',
  screenGlow: '#9fb7d6',
  hemiSky: '#3b4560',
  hemiGround: '#17130f',
}
