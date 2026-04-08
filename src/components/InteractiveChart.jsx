import { useRef, useState } from 'react'
import { formatNum, formatTime, pickAxisTicks } from '../data/utils'

export default function InteractiveChart({ closes, timestamps, isUp, rangeLabel }) {
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null)

  if (!closes || closes.length < 2) return null

  const valid = []
  const validTs = []
  closes.forEach((c, i) => {
    if (c != null) {
      valid.push(c)
      validTs.push(timestamps?.[i] || 0)
    }
  })

  const min = Math.min(...valid)
  const max = Math.max(...valid)
  const range = max - min || 1
  const w = 800
  const h = 300
  const pad = 2

  const pts = valid.map((c, i) => ({
    x: (i / (valid.length - 1)) * w,
    y: h - pad - ((c - min) / range) * (h - pad * 2),
    price: c,
    ts: validTs[i],
  }))

  const points = pts.map(p => `${p.x},${p.y}`).join(' ')
  const fillPoints = `0,${h} ${points} ${w},${h}`
  const color = isUp ? '#22c55e' : '#ef4444'
  const fillColor = isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'

  function handleMove(e) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const relX = (clientX - rect.left) / rect.width
    const idx = Math.round(relX * (pts.length - 1))
    if (idx >= 0 && idx < pts.length) {
      setHover({ idx, pt: pts[idx] })
    }
  }

  function handleLeave() {
    setHover(null)
  }

  return (
    <div style={{ position: 'relative', touchAction: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 300, cursor: 'crosshair' }}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
      >
        <defs>
          <linearGradient id="chartGradDetail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill="url(#chartGradDetail)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hover && (
          <>
            <line
              x1={hover.pt.x} y1={0} x2={hover.pt.x} y2={h}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4"
            />
            <line
              x1={0} y1={hover.pt.y} x2={w} y2={hover.pt.y}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4"
            />
            <circle cx={hover.pt.x} cy={hover.pt.y} r="6" fill={color} opacity="0.3" />
            <circle cx={hover.pt.x} cy={hover.pt.y} r="3.5" fill={color} stroke="#0a0a0a" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Timeline axis */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '8px 0 0 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 4,
      }}>
        {pickAxisTicks(pts, rangeLabel).map((tick, i) => (
          <span key={i} style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(255,255,255,0.35)',
            whiteSpace: 'nowrap',
          }}>
            {tick.label}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {hover && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: hover.pt.x > w * 0.7 ? undefined : `${(hover.pt.x / w) * 100}%`,
          right: hover.pt.x > w * 0.7 ? `${100 - (hover.pt.x / w) * 100}%` : undefined,
          transform: hover.pt.x > w * 0.7 ? 'translateX(10%)' : 'translateX(-10%)',
          background: 'rgba(20,20,20,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          padding: '8px 14px',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            color: isUp ? '#4ade80' : '#f87171',
          }}>
            ${formatNum(hover.pt.price)}
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(255,255,255,0.4)',
            marginTop: 2,
          }}>
            {formatTime(hover.pt.ts, rangeLabel)}
          </div>
        </div>
      )}
    </div>
  )
}
