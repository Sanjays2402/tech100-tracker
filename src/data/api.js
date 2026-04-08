import { STOCKS } from '../data/stocks'

const CORS_PROXY = 'https://corsproxy.io/?'

export async function fetchQuotesBatch(symbols) {
  const batches = []
  for (let i = 0; i < symbols.length; i += 20) {
    batches.push(symbols.slice(i, i + 20))
  }

  const results = []
  for (const batch of batches) {
    const syms = batch.join(',')
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}`
    const corsUrl = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`
    const localUrl = `/api/yahoo/v7/finance/quote?symbols=${syms}`

    let data = null
    try {
      const res = await fetch(yahooUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data = await res.json()
    } catch {
      try {
        const res = await fetch(corsUrl)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        data = await res.json()
      } catch {
        try {
          const res = await fetch(localUrl)
          if (res.ok) data = await res.json()
        } catch {
          // silently fail this batch
        }
      }
    }

    if (data?.quoteResponse?.result) {
      results.push(...data.quoteResponse.result)
    }
  }

  return results
}

export async function fetchChart(symbol, range, interval) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
  const corsUrl = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`
  const localUrl = `/api/yahoo/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`

  let res
  try {
    res = await fetch(yahooUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch {
    try {
      res = await fetch(corsUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      res = await fetch(localUrl)
    }
  }

  const json = await res.json()
  return json.chart.result[0]
}

export function getStockInfo(symbol) {
  return STOCKS.find(s => s.symbol === symbol)
}
