import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { formatNum } from '../data/utils'

export default function StockCard({ quote, index }) {
  const navigate = useNavigate()

  const price = quote.regularMarketPrice || 0
  const change = quote.regularMarketChange || 0
  const changePct = quote.regularMarketChangePercent || 0
  const isUp = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.6) }}
      onClick={() => navigate(`/${quote.symbol}`)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${isUp ? '#22c55e' : '#ef4444'}`,
        borderRadius: 14,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.12)',
        y: -2,
      }}
    >
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${isUp ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.01em',
          }}>
            {quote.symbol}
          </div>
          <div style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Inter', sans-serif",
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 140,
          }}>
            {quote.shortName || quote.longName || ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.02em',
          }}>
            ${formatNum(price)}
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            color: isUp ? '#4ade80' : '#f87171',
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isUp ? '#22c55e' : '#ef4444',
              display: 'inline-block',
              boxShadow: `0 0 8px ${isUp ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
            }} />
            {isUp ? '+' : ''}{changePct.toFixed(2)}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}
