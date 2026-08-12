import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

process.env.BROWSERSLIST_IGNORE_OLD_DATA = '1'

// https://vite.dev/config/
const marketRanges: Record<string, { interval: string; outputsize: number }> = {
  '1D': { interval: '5min', outputsize: 78 },
  '1W': { interval: '1h', outputsize: 35 },
  '1M': { interval: '1day', outputsize: 31 },
  '3M': { interval: '1day', outputsize: 95 },
  YTD: { interval: '1day', outputsize: 260 },
  '1Y': { interval: '1week', outputsize: 54 },
  '5Y': { interval: '1month', outputsize: 61 },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: env.TWELVE_DATA_API_KEY && env.TWELVE_DATA_LIVE_REQUESTS_ENABLED !== 'false' ? {
        '/api/market-data': {
          target: 'https://api.twelvedata.com',
          changeOrigin: true,
          secure: true,
          rewrite(path) {
            const incoming = new URL(path, 'http://localhost')
            const symbol = (incoming.searchParams.get('symbol') || '').toUpperCase()
            const range = (incoming.searchParams.get('range') || '3M').toUpperCase()
            const config = marketRanges[range] || marketRanges['3M']
            const params = new URLSearchParams({
              symbol,
              interval: config.interval,
              outputsize: String(config.outputsize),
              order: 'ASC',
              timezone: 'America/New_York',
              adjust: 'splits',
              apikey: env.TWELVE_DATA_API_KEY || '',
            })

            return `/time_series?${params.toString()}`
          },
        },
      } : undefined,
    },
  }
})
