import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import predictionArtifact from './ml/artifacts/current-predictions.json'
// Vercel functions are also mounted locally so `yarn dev` matches production.
// @ts-expect-error The serverless handler is intentionally plain JavaScript.
import priceMonitorHandler from './api/price-monitor.js'

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

const localPredictionsApi = {
  name: 'local-predictions-api',
  configureServer(server: { middlewares: { use: (route: string, handler: (request: { url?: string }, response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }) => void) => void } }) {
    server.middlewares.use('/api/predictions', (request, response) => {
      const query = new URL(request.url || '/', 'http://localhost').searchParams
      const symbol = (query.get('symbol') || '').trim().toUpperCase()
      response.setHeader('Content-Type', 'application/json')
      if (!predictionArtifact.validationPassed) {
        response.statusCode = 503
        response.end(JSON.stringify({ error: 'No prediction model has passed out-of-sample validation', validationPassed: false }))
        return
      }
      if (query.get('top') === 'true') {
        response.end(JSON.stringify({ generatedAt: predictionArtifact.generatedAt, modelVersion: predictionArtifact.modelVersion, predictions: [...predictionArtifact.predictions].sort((a, b) => (b.boomProbability ?? -1) - (a.boomProbability ?? -1)) }))
        return
      }
      const prediction = predictionArtifact.predictions.find(item => item.symbol === symbol)
      if (!prediction) response.statusCode = /^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol) ? 404 : 400
      response.end(JSON.stringify(prediction || { error: symbol ? 'No validated prediction is available for this symbol' : 'A valid symbol is required' }))
    })
  },
}

type LocalResponse = {
  statusCode: number
  setHeader: (name: string, value: string) => void
  end: (body: string) => void
}

const localPriceMonitorApi = {
  name: 'local-price-monitor-api',
  configureServer(server: { middlewares: { use: (route: string, handler: (request: { url?: string; method?: string; headers: Record<string, string | string[] | undefined> }, response: LocalResponse) => void) => void } }) {
    let cachedPayload = ''
    let cachedAt = 0
    server.middlewares.use('/api/price-monitor', async (request, response) => {
      const query = new URL(request.url || '/', 'http://localhost').searchParams
      if (query.get('view') !== 'status') {
        response.statusCode = 401
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: 'Unauthorized' }))
        return
      }
      if (cachedPayload && Date.now() - cachedAt < 60 * 60 * 1000) {
        response.setHeader('Content-Type', 'application/json')
        response.end(cachedPayload)
        return
      }
      await priceMonitorHandler(
        { method: 'GET', query: { view: 'status' }, headers: request.headers },
        {
          status(code: number) { response.statusCode = code; return this },
          setHeader(name: string, value: string) { response.setHeader(name, value) },
          json(payload: unknown) {
            cachedPayload = JSON.stringify(payload)
            cachedAt = Date.now()
            response.setHeader('Content-Type', 'application/json')
            response.end(cachedPayload)
          },
        }
      )
    })
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), localPredictionsApi, localPriceMonitorApi],
    server: {
      proxy: (env.TWELVE_DATA_API_KEY && env.TWELVE_DATA_LIVE_REQUESTS_ENABLED !== 'false') || (env.BRAVE_SEARCH_API_KEY && env.BRAVE_SEARCH_ENABLED !== 'false') ? {
        ...(env.TWELVE_DATA_API_KEY && env.TWELVE_DATA_LIVE_REQUESTS_ENABLED !== 'false' ? { '/api/market-data': {
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
        } } : {}),
        ...(env.BRAVE_SEARCH_API_KEY && env.BRAVE_SEARCH_ENABLED !== 'false' ? {
          '/api/search': {
            target: 'https://api.search.brave.com', changeOrigin: true, secure: true,
            headers: { Accept: 'application/json', 'X-Subscription-Token': env.BRAVE_SEARCH_API_KEY },
            rewrite(path: string) { const incoming=new URL(path,'http://localhost'); const params=new URLSearchParams({q:incoming.searchParams.get('q')||'',count:'10',country:'us',search_lang:'en',safesearch:'moderate',spellcheck:'1'}); return `/res/v1/web/search?${params}` },
          },
        } : {}),
      } : undefined,
    },
  }
})
