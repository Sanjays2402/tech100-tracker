import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { STOCKS } from '../data/stocks'
import { fetchQuotesBatch } from '../data/api'
import StockCard from '../components/StockCard'
import SkeletonCard from '../components/SkeletonCard'

const SORT_OPTIONS = [
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'change_pct', label: 'Change %' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'Name' },
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'gainers', label: '▲ Gainers' },
  { value: 'losers', label: '▼ Losers' },
]

export default function HomePage() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('market_cap')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const symbols = STOCKS.map(s => s.symbol)
      const data = await fetchQuotesBatch(symbols)
      if (!cancelled) {
        setQuotes(data)
        setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const processed = useMemo(() => {
    let list = [...quotes]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.symbol?.toLowerCase().includes(q) ||
        (s.shortName || s.longName || '').toLowerCase().includes(q)
      )
    }

    // Filter
    if (filter === 'gainers') {
      list = list.filter(s => (s.regularMarketChange || 0) >= 0)
    } else if (filter === 'losers') {
      list = list.filter(s => (s.regularMarketChange || 0) < 0)
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'market_cap':
          return (b.marketCap || 0) - (a.marketCap || 0)
        case 'change_pct':
          return Math.abs(b.regularMarketChangePercent || 0) - Math.abs(a.regularMarketChangePercent || 0)
        case 'price':
          return (b.regularMarketPrice || 0) - (a.regularMarketPrice || 0)
        case 'name':
          return (a.symbol || '').localeCompare(b.symbol || '')
        default:
          return 0
      }
    })

    return list
  }, [quotes, search, sort, filter])

  const gainersCount = quotes.filter(s => (s.regularMarketChange || 0) >= 0).length
  const losersCount = quotes.filter(s => (s.regularMarketChange || 0) < 0).length

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            📊
          </div>
          <div>
            <h1 style={{
              fontSize: 32, fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.03em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Tech 100
            </h1>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 4,
            }}>
              {loading ? 'Loading...' : `${quotes.length} stocks · ${gainersCount} up · ${losersCount} down`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <svg style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, opacity: 0.35,
          }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search ticker or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            color: '#fff',
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            minWidth: 130,
          }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#1a1a1a' }}>
              Sort: {o.label}
            </option>
          ))}
        </select>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: filter === f.value
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(255,255,255,0.03)',
                color: filter === f.value
                  ? '#fff'
                  : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {loading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : processed.map((q, i) => (
              <StockCard key={q.symbol} quote={q} index={i} />
            ))
        }
      </div>

      {!loading && processed.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'Inter', sans-serif",
        }}>
          No stocks match your search.
        </div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '40px 0 20px',
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
