const RANGE_CONFIG = {
  "1D": { interval: "5min", outputsize: 78 },
  "1W": { interval: "1h", outputsize: 35 },
  "1M": { interval: "1day", outputsize: 31 },
  "3M": { interval: "1day", outputsize: 95 },
  YTD: { interval: "1day", outputsize: 260 },
  "1Y": { interval: "1week", outputsize: 54 },
  "5Y": { interval: "1month", outputsize: 61 },
};

const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const symbol = String(req.query.symbol || "").trim().toUpperCase();
  const range = String(req.query.range || "3M").toUpperCase();
  const config = RANGE_CONFIG[range];

  if (!SYMBOL_PATTERN.test(symbol) || !config) {
    return res.status(400).json({ error: "Invalid symbol or range" });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Market data is not configured" });
  }

  const params = new URLSearchParams({
    symbol,
    interval: config.interval,
    outputsize: String(config.outputsize),
    order: "ASC",
    timezone: "America/New_York",
    apikey: apiKey,
  });

  try {
    const response = await fetch(`https://api.twelvedata.com/time_series?${params}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (!response.ok || payload.status === "error" || !Array.isArray(payload.values)) {
      const message = payload.message || "Market data provider returned no data";
      const status = payload.code === 429 ? 429 : 502;
      return res.status(status).json({ error: message });
    }

    const points = payload.values.map((point) => ({
      datetime: point.datetime,
      open: Number(point.open),
      high: Number(point.high),
      low: Number(point.low),
      close: Number(point.close),
      volume: Number(point.volume || 0),
    }));
    const first = points[0];
    const latest = points[points.length - 1];
    const previous = points[Math.max(0, points.length - 2)];

    res.setHeader("Cache-Control", range === "1D" ? "s-maxage=60, stale-while-revalidate=300" : "s-maxage=900, stale-while-revalidate=3600");
    return res.status(200).json({
      symbol,
      range,
      interval: config.interval,
      currency: payload.meta?.currency || "USD",
      exchange: payload.meta?.exchange || "",
      points,
      summary: {
        latest: latest.close,
        change: latest.close - previous.close,
        changePercent: previous.close ? ((latest.close - previous.close) / previous.close) * 100 : 0,
        periodChangePercent: first.close ? ((latest.close - first.close) / first.close) * 100 : 0,
        high: Math.max(...points.map((point) => point.high)),
        low: Math.min(...points.map((point) => point.low)),
        volume: latest.volume,
        asOf: latest.datetime,
      },
    });
  } catch (error) {
    console.error("Market data request failed", error);
    return res.status(502).json({ error: "Unable to retrieve market data" });
  }
}
