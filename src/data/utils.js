export function formatNum(n) {
  if (!n && n !== 0) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatBigNum(n) {
  if (!n) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${formatNum(n)}`
}

export function formatTime(ts, rangeLabel) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  if (rangeLabel === '1D') {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  if (rangeLabel === '5D') {
    return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatAxisLabel(ts, rangeLabel) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  if (rangeLabel === '1D') {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  if (rangeLabel === '5D') {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  if (rangeLabel === '1M' || rangeLabel === '3M') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function pickAxisTicks(pts, rangeLabel) {
  const count = Math.min(7, pts.length)
  if (count < 2) return []
  const ticks = []
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (pts.length - 1))
    ticks.push({ ...pts[idx], label: formatAxisLabel(pts[idx].ts, rangeLabel) })
  }
  return ticks
}
