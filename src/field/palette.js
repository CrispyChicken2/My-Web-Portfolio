// The Field's colours come from the Token block like everything else — the
// shader is not allowed its own palette.

function hexToRgb(hex, fallback) {
  const value = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim()) ? hex.trim() : fallback
  let body = value.replace('#', '')
  if (body.length === 3) body = body.split('').map((c) => c + c).join('')
  const n = parseInt(body, 16)
  return new Float32Array([((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255])
}

const TOKENS = {
  ink: ['--field-ink', '#04070a'],
  deep: ['--field-deep', '#0a2831'],
  mid: ['--field-mid', '#17545f'],
  glow: ['--field-glow', '#74c2cb'],
  point: ['--field-point', '#dcf1f5'],
  navTint: ['--field-nav-tint', '#08101a'],
}

export function readPalette(root = document.documentElement) {
  const styles = getComputedStyle(root)
  const palette = {}
  for (const [key, [token, fallback]] of Object.entries(TOKENS)) {
    palette[key] = hexToRgb(styles.getPropertyValue(token) || '', fallback)
  }
  return palette
}
