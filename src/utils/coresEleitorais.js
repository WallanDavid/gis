export function scaleSequential(value, max, color) {
  if (!max || max <= 0) return '#f1f5f9'
  const t = Math.max(0, Math.min(1, value / max))
  const a = 0.25 + 0.65 * t
  return hexWithAlpha(color, a)
}

function hexWithAlpha(hex, alpha) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
