import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchChart, getStockInfo } from '../data/api'
import { formatNum, formatBigNum } from '../data/utils'
import InteractiveChart from '../components/InteractiveChart'

const RANGES = [
  { label: '1D', range: '1d', interval: '5m' },
  { label: '5D', range: '5d', interval: '15m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1wk' },
  { label: '1Y', range: '1y', interval: '1wk' },
  { label: '5Y', range: '5y', interval: '1mo' },
]

export default function StockPage() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const stockInfo = getStockInfo(symbol?.toUpperCase())

  const [data, setData] = useState(null)
  const [range, setRange] = useState('1mo')
  const [interval_, setInterval_] = useState('1d')
  const [rangeLabel, setRangeLabel] = useState('1M')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (r, i) => {
    setLoading(true)
    try {
      const result = await fetchChart(symbol.toUpperCase(), r, i)
      setData(result)
    } catch (e) {
      console.error('Chart fetch failed:', e)
    }
    setLoading(false)
  }, [symbol])

  useEffect(() => {
    fetchData(range, interval_)
    const id = setInterval(() => fetchData(range, interval_), 60000)
    return () => clearInterval(id)
  }, [range, interval_, fetchData])

  const meta = data?.meta || {}
  const closes = data?.indicators?.quote?.[0]?.close || []
  const timestamps = data?.timestamp || []
  const validCloses = closes.filter(c => c != null)
  const price = meta.regularMarketPrice || 0
  const prevClose = meta.chartPreviousClose || meta.previousClose || validCloses[0] || price
  const change = price - prevClose
  const changePct = prevClose ? ((change / prevClose) * 100) : 0
  const isUp = change >= 0
  const chartHigh = validCloses.length ? Math.max(...validCloses) : 0
  const chartLow = validCloses.length ? Math.min(...validCloses) : 0

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '8px 16px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer',
          marginBottom: 28,
          transition: 'all 0.2s',
        }}
        whileHover={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Tech 100
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: isUp ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 40px ${isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}>
            {(symbol || '').slice(0, 2)}
          </div>
          <div>
            <h1 style={{
              fontSize: 36, fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {stockInfo?.name || symbol}{' '}
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 24 }}>
                {symbol?.toUpperCase()}
              </span>
            </h1>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 4,
            }}>
              {meta.exchangeName || 'NASDAQ'} · {loading ? 'Loading...' : 'Real-time data'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          marginTop: 24,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 56, fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            ${formatNum(price)}
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px',
            borderRadius: 999,
            background: isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: isUp ? '#4ade80' : '#f87171',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16, fontWeight: 600,
          }}>
            {isUp ? '▲' : '▼'} ${formatNum(Math.abs(change))} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Range selector */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {RANGES.map(r => (
            <button
              key={r.range}
              onClick={() => { setRange(r.range); setInterval_(r.interval); setRangeLabel(r.label) }}
              style={{
                padding: '8px 18px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, fontWeight: 600,
                background: range === r.range
                  ? (isUp ? '#22c55e' : '#ef4444')
                  : 'rgba(255,255,255,0.05)',
                color: range === r.range
                  ? '#0a0a0a'
                  : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          {loading && !validCloses.length ? (
            <div style={{
              height: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
            }}>
              Loading chart...
            </div>
          ) : (
            <InteractiveChart
              closes={closes}
              timestamps={timestamps}
              isUp={isUp}
              rangeLabel={rangeLabel}
            />
          )}
          {validCloses.length > 0 && (
            <div style={{
              position: 'absolute', top: 8, right: 12,
              display: 'flex', flexDirection: 'column', gap: 4,
              alignItems: 'flex-end',
            }}>
              <span style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255,255,255,0.3)',
              }}>
                H ${formatNum(chartHigh)}
              </span>
              <span style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255,255,255,0.3)',
              }}>
                L ${formatNum(chartLow)}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Market Cap', value: formatBigNum(meta.marketCap || 0) },
          { label: 'Volume', value: meta.regularMarketVolume ? meta.regularMarketVolume.toLocaleString() : '—' },
          { label: '52W High', value: meta.fiftyTwoWeekHigh ? `$${formatNum(meta.fiftyTwoWeekHigh)}` : '—' },
          { label: '52W Low', value: meta.fiftyTwoWeekLow ? `$${formatNum(meta.fiftyTwoWeekLow)}` : '—' },
          { label: 'P/E Ratio', value: meta.trailingPE ? meta.trailingPE.toFixed(2) : '—' },
          { label: 'Open', value: meta.regularMarketOpen ? `$${formatNum(meta.regularMarketOpen)}` : '—' },
          { label: 'Prev Close', value: meta.chartPreviousClose ? `$${formatNum(meta.chartPreviousClose)}` : '—' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 20,
            backdropFilter: 'blur(20px)',
            transition: 'all 0.25s ease',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          textAlign: 'center',
          padding: '30px 0',
          fontSize: 12,
          color: 'rgba(255,255,255,0.25)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Data from Yahoo Finance · Updates every 60s · Built by Sanjay 🥔
      </motion.div>
    </div>
  )
}
