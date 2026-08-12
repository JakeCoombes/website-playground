import { useEffect, useMemo, useState } from "react";
import "./SignalAI.css";

type Stock = { symbol: string; name: string; sector: string; price: number; change: number; score: number; pe: number; growth: number; cap: string };

const stocks: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA", sector: "Technology", price: 182.74, change: 3.82, score: 94, pe: 47.2, growth: 78, cap: "4.46T" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", price: 527.13, change: 1.14, score: 91, pe: 38.6, growth: 34, cap: "3.92T" },
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare", price: 812.48, change: 2.41, score: 89, pe: 55.1, growth: 41, cap: "771B" },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer", price: 231.19, change: -0.46, score: 86, pe: 35.4, growth: 29, cap: "2.47T" },
  { symbol: "AVGO", name: "Broadcom", sector: "Technology", price: 308.62, change: 4.08, score: 84, pe: 62.3, growth: 47, cap: "1.45T" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials", price: 291.31, change: 0.72, score: 79, pe: 15.2, growth: 12, cap: "801B" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer", price: 337.84, change: -2.18, score: 68, pe: 188.4, growth: 9, cap: "1.09T" },
];

type MarketPoint = { datetime: string; open: number; high: number; low: number; close: number; volume: number };
type MarketData = { symbol: string; range: string; currency: string; exchange: string; points: MarketPoint[]; summary: { latest: number; change: number; changePercent: number; periodChangePercent: number; high: number; low: number; volume: number; asOf: string } };
type TwelveDataResponse = { meta?: { symbol?: string; currency?: string; exchange?: string }; values?: Array<Record<string, string>>; status?: string; message?: string };
type Prediction = { symbol:string; generatedAt:string; horizonDays:number; boomProbability:number; bustProbability:number; expectedExcessReturn:number; confidence:number; modelVersion:string; factors:{positive:string[];negative:string[]}; scores:{trend:number;momentum:number;relativeStrength:number;volatilityRisk:number;volume:number} };

function normalizeMarketData(body: MarketData | TwelveDataResponse, symbol: string, range: string): MarketData {
  if ("points" in body) return body;
  if (!Array.isArray(body.values) || body.values.length === 0) throw new Error(body.message || "Market data provider returned no data");
  const points = body.values.map(point => ({ datetime: point.datetime, open: Number(point.open), high: Number(point.high), low: Number(point.low), close: Number(point.close), volume: Number(point.volume || 0) }));
  const first = points[0]; const latest = points[points.length - 1]; const previous = points[Math.max(0, points.length - 2)];
  return { symbol, range, currency: body.meta?.currency || "USD", exchange: body.meta?.exchange || "", points, summary: { latest: latest.close, change: latest.close - previous.close, changePercent: previous.close ? ((latest.close - previous.close) / previous.close) * 100 : 0, periodChangePercent: first.close ? ((latest.close - first.close) / first.close) * 100 : 0, high: Math.max(...points.map(point => point.high)), low: Math.min(...points.map(point => point.low)), volume: latest.volume, asOf: latest.datetime } };
}

function Icon({ name }: { name: "spark" | "search" | "bell" | "grid" | "chart" | "screen" | "book" | "settings" | "arrow" }) {
  const paths = {
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>, screen: <><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></>, book: <><path d="M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3V5Z"/><path d="M4 19a3 3 0 0 1 3-3h13"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>, arrow: <path d="m9 18 6-6-6-6"/>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function PriceChart({ range, stock, marketData, loading, error, onInspect }: { range: string; stock: Stock; marketData: MarketData | null; loading: boolean; error: string; onInspect: (point: MarketPoint | null) => void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  if (loading) return <div className="market-chart-state" role="status"><i/><span>Loading verified market data…</span></div>;
  if (error || !marketData?.points.length) return <div className="market-chart-state error" role="alert"><strong>Live chart unavailable</strong><span>{error || "No market data was returned."}</span></div>;
  const series = marketData.points.map(point => point.close);
  const minimum = Math.min(...series);
  const maximum = Math.max(...series);
  const spread = Math.max(maximum - minimum, 1);
  const chartX = (index: number) => (index / Math.max(series.length - 1, 1)) * 700;
  const chartY = (value: number) => 315 - ((value - minimum) / spread) * 275;
  const points = series.map((value, index) => `${chartX(index)},${chartY(value)}`).join(" ");
  const area = `0,320 ${points} 700,320`;
  const activePoint = activeIndex === null ? null : marketData.points[activeIndex];
  const activeX = activeIndex === null ? 0 : chartX(activeIndex);
  const activeY = activePoint ? chartY(activePoint.close) : 0;
  return <div className="signal-chart" role="application" tabIndex={0} aria-label={`${stock.symbol} ${range} interactive price chart. Use pointer or arrow keys to inspect data points.`}
    onPointerMove={event => { const bounds=event.currentTarget.getBoundingClientRect(); const ratio=Math.min(1,Math.max(0,(event.clientX-bounds.left)/bounds.width)); const index=Math.round(ratio*(marketData.points.length-1));setActiveIndex(index);onInspect(marketData.points[index]) }}
    onPointerLeave={()=>{setActiveIndex(null);onInspect(null)}} onFocus={()=>{const index=activeIndex??marketData.points.length-1;setActiveIndex(index);onInspect(marketData.points[index])}} onBlur={()=>{setActiveIndex(null);onInspect(null)}}
    onKeyDown={event=>{if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;event.preventDefault();const direction=event.key==="ArrowRight"?1:-1;const index=Math.min(marketData.points.length-1,Math.max(0,(activeIndex??marketData.points.length-1)+direction));setActiveIndex(index);onInspect(marketData.points[index])}}>
    <svg viewBox="0 0 700 340" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#60a5fa" stopOpacity=".3"/><stop offset="1" stopColor="#60a5fa" stopOpacity="0"/></linearGradient></defs>
      {[40,110,180,250,320].map(y => <line key={y} x1="0" x2="700" y1={y} y2={y} className="chart-grid" />)}
      <polygon points={area} fill="url(#signalFill)"/><polyline points={points} className="chart-line"/>
      {activePoint && <line x1={activeX} x2={activeX} y1="30" y2="320" className="chart-crosshair"/>}
    </svg>
    {activePoint && <div className="chart-marker-layer" aria-hidden="true"><span className="chart-hover-dot" style={{left:`${activeX/7}%`,top:`${activeY/3.4}%`}}/></div>}
    {activePoint && <div className={`chart-inspect-date ${activeX>540?"align-left":""}`} style={{left:`${activeX/7}%`}}>{new Date(activePoint.datetime.replace(" ","T")).toLocaleString(undefined,range==="1D"?{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}:{month:"short",day:"numeric",year:"numeric"})}</div>}
    <div className="chart-axis">{[0,.25,.5,.75,1].map(position => { const point = marketData.points[Math.min(marketData.points.length - 1, Math.round((marketData.points.length - 1) * position))]; return <span key={position}>{new Date(point.datetime.replace(" ","T")).toLocaleDateString(undefined, range === "1D" ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: range === "5Y" ? undefined : "numeric", year: range === "5Y" ? "2-digit" : undefined })}</span> })}</div>
    <span className="forecast-tag">{marketData.summary.periodChangePercent >= 0 ? "+" : ""}{marketData.summary.periodChangePercent.toFixed(1)}% {range}</span>
  </div>;
}

export default function SignalAI() {
  const [query, setQuery] = useState(""); const [sector, setSector] = useState("All sectors"); const [sort, setSort] = useState<keyof Stock>("score"); const [range, setRange] = useState("3M"); const [selected, setSelected] = useState("NVDA"); const [minScore, setMinScore] = useState(0); const [watchlist, setWatchlist] = useState(["MSFT", "LLY"]); const [showAnalysis, setShowAnalysis] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null); const [marketLoading, setMarketLoading] = useState(true); const [marketError, setMarketError] = useState(""); const [prediction,setPrediction]=useState<Prediction|null>(null); const [predictionStatus,setPredictionStatus]=useState("Checking validated model…");
  const selectedStock = stocks.find(s => s.symbol === selected) ?? stocks[0];
  const [inspectedPoint,setInspectedPoint]=useState<MarketPoint|null>(null);
  const livePrice = inspectedPoint?.close ?? marketData?.summary.latest;
  const rangeStartPrice = marketData?.points[0]?.close;
  const liveChange = inspectedPoint && rangeStartPrice != null ? inspectedPoint.close-rangeStartPrice : marketData?.summary.change;
  const liveChangePercent = inspectedPoint && rangeStartPrice ? ((inspectedPoint.close-rangeStartPrice)/rangeStartPrice)*100 : marketData?.summary.changePercent;
  const technicals = useMemo(() => { if (!marketData?.points.length) return null; const closes = marketData.points.map(point => point.close); const returns = closes.slice(1).map((value,index)=>(value-closes[index])/closes[index]); const average = returns.reduce((sum,value)=>sum+value,0)/Math.max(returns.length,1); const variance = returns.reduce((sum,value)=>sum+(value-average)**2,0)/Math.max(returns.length,1); const window = closes.slice(-Math.min(20,closes.length)); return { average: window.reduce((sum,value)=>sum+value,0)/window.length, volatility: Math.sqrt(variance)*Math.sqrt(252)*100 } }, [marketData]);
  const filtered = useMemo(() => stocks.filter(s => (sector === "All sectors" || s.sector === sector) && s.score >= minScore && `${s.symbol} ${s.name}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => typeof a[sort] === "number" ? Number(b[sort])-Number(a[sort]) : String(a[sort]).localeCompare(String(b[sort]))), [query, sector, sort, minScore]);
  const toggleWatchlist = () => setWatchlist(current => current.includes(selected) ? current.filter(symbol => symbol !== selected) : [...current, selected]);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `signal-market:${selected}:${range}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const entry = JSON.parse(cached) as { savedAt: number; data: MarketData };
      if (Date.now() - entry.savedAt < 15 * 60_000) {
        setMarketData(entry.data); setMarketError(""); setMarketLoading(false); return;
      }
    }
    setMarketLoading(true); setMarketError("");
    const timer = window.setTimeout(() => {
      fetch(`/api/market-data?symbol=${encodeURIComponent(selected)}&range=${encodeURIComponent(range)}`, { signal: controller.signal })
        .then(async response => { const body = await response.json(); if (!response.ok || body.status === "error") throw new Error(body.error || body.message || "Market data request failed"); return normalizeMarketData(body, selected, range) })
        .then(data => { setMarketData(data); sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data })) })
        .catch(error => { if (error.name !== "AbortError") { setMarketData(null); setMarketError(error.message) } })
        .finally(() => { if (!controller.signal.aborted) setMarketLoading(false) });
    }, 400);
    return () => { window.clearTimeout(timer); controller.abort() };
  }, [selected, range]);
  useEffect(()=>{const controller=new AbortController();setPrediction(null);setPredictionStatus("Checking validated model…");fetch(`/api/predictions?symbol=${encodeURIComponent(selected)}`,{signal:controller.signal}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||"Prediction unavailable");return body as Prediction}).then(value=>{setPrediction(value);setPredictionStatus("")}).catch(error=>{if(error.name!=="AbortError")setPredictionStatus(error.message)});return()=>controller.abort()},[selected]);
  return <div className="signal-app">
    <aside className="signal-sidebar">
      <div className="signal-logo"><span><Icon name="spark"/></span><strong>Signal<span>AI</span></strong></div>
      <nav aria-label="Signal AI navigation">
        <button className="active" onClick={()=>scrollTo("signal-overview")}><Icon name="grid"/><span>Overview</span></button><button onClick={()=>scrollTo("signal-markets")}><Icon name="chart"/><span>Markets</span></button><button onClick={()=>scrollTo("signal-screener")}><Icon name="screen"/><span>Screener</span></button><button onClick={()=>scrollTo("signal-watchlist")}><Icon name="book"/><span>Watchlist</span><i>{watchlist.length}</i></button>
      </nav>
      <div className="side-bottom"><button><Icon name="settings"/><span>Settings</span></button><div className="signal-profile"><b>JC</b><div><strong>Jake C.</strong><span>Pro workspace</span></div></div></div>
    </aside>
    <main className="signal-main">
      <header className="signal-header"><div><p>MARKET INTELLIGENCE</p><h1>Good morning, Jake.</h1></div><div className="signal-header-actions"><label><Icon name="search"/><span className="sr-only">Search stocks</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search ticker or company"/></label><button aria-label="Notifications"><Icon name="bell"/><i/></button></div></header>
      <div className="market-strip" id="signal-markets"><span><i/> Markets open</span><div><b>S&amp;P 500</b><strong>6,389.45</strong><em>+0.62%</em></div><div><b>NASDAQ</b><strong>21,450.02</strong><em>+0.91%</em></div><div><b>VIX</b><strong>14.72</strong><em className="down">-3.28%</em></div><small>Demo market data</small></div>
      <section className="signal-kpis" id="signal-overview" aria-label="Portfolio overview"><article><span>Portfolio value</span><strong>$128,430.82</strong><em>+$2,148 today</em></article><article><span>AI opportunities</span><strong>12</strong><em>3 new signals</em></article><article><span>Win probability</span><strong>71.4%</strong><em>Across watchlist</em></article><article><span>Risk exposure</span><strong>Moderate</strong><em className="amber">Tech concentration</em></article></section>
      <section className="signal-layout">
        <div className="signal-primary">
          <article className="signal-card stock-focus">
            <div className="stock-heading"><div className="ticker-icon">{selectedStock.symbol[0]}</div><div><span>NASDAQ · {selectedStock.symbol}</span><h2>{selectedStock.name}</h2></div><button onClick={toggleWatchlist}>{watchlist.includes(selected) ? "✓ Watching" : "+ Watchlist"}</button></div>
            <div className="stock-price"><strong>{livePrice != null ? `$${livePrice.toFixed(2)}` : "—"}</strong><span className={(liveChangePercent ?? 0) < 0 ? "negative" : ""}>{liveChange != null ? `${liveChange >= 0 ? "+" : ""}$${Math.abs(liveChange).toFixed(2)} (${Math.abs(liveChangePercent ?? 0).toFixed(2)}%) ${inspectedPoint ? range : "latest session"}` : "Waiting for market data"}</span></div>
            <div className="fundamental-strip"><div><span>{range} high</span><b>{marketData ? `$${marketData.summary.high.toFixed(2)}` : "—"}</b></div><div><span>{range} low</span><b>{marketData ? `$${marketData.summary.low.toFixed(2)}` : "—"}</b></div><div><span>20-period average</span><b>{technicals ? `$${technicals.average.toFixed(2)}` : "—"}</b></div><div><span>Annualized volatility</span><b>{technicals ? `${technicals.volatility.toFixed(1)}%` : "—"}</b></div></div>
            <div className="range-tabs" aria-label="Chart time range">{["1D","1W","1M","3M","YTD","1Y","5Y"].map(r=><button key={r} className={range===r?"active":""} onClick={()=>setRange(r)}>{r}</button>)}</div>
            <PriceChart range={range} stock={selectedStock} marketData={marketData} loading={marketLoading} error={marketError} onInspect={setInspectedPoint}/>
            <div className="chart-legend"><span><i className="solid"/> Twelve Data close price</span><span>{marketData ? `${marketData.exchange} · ${marketData.currency}` : "Provider not connected"}</span><span>{marketData ? `As of ${marketData.summary.asOf} ET` : "Add TWELVE_DATA_API_KEY"}</span></div>
          </article>
          <article className="signal-card screener-card" id="signal-screener">
            <div className="card-title"><div><p>DEMO STOCK SCREENER</p><h2>Example ranking workspace</h2></div><span>Scores are illustrative</span></div>
            <div className="screener-tools"><label><Icon name="search"/><span className="sr-only">Filter companies</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter companies"/></label><select value={sector} onChange={e=>setSector(e.target.value)} aria-label="Filter by sector"><option>All sectors</option><option>Technology</option><option>Healthcare</option><option>Consumer</option><option>Financials</option></select><select value={minScore} onChange={e=>setMinScore(Number(e.target.value))} aria-label="Minimum AI score"><option value="0">Any AI score</option><option value="80">Score 80+</option><option value="90">Score 90+</option></select></div>
            <div className="stock-table-wrap"><table><thead><tr><th>Company</th><th><button onClick={()=>setSort("price")}>Price</button></th><th><button onClick={()=>setSort("change")}>Today</button></th><th><button onClick={()=>setSort("score")}>AI score ↓</button></th><th>P/E</th><th>Growth</th></tr></thead><tbody>{filtered.map(s=><tr key={s.symbol} tabIndex={0} className={selected===s.symbol?"selected":""} onClick={()=>setSelected(s.symbol)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(s.symbol)}}}><td><b>{s.symbol}</b><span>{s.name}</span></td><td>${s.price.toFixed(2)}</td><td className={s.change>=0?"positive":"negative"}>{s.change>=0?"+":""}{s.change}%</td><td><div className="score"><i><span style={{width:`${s.score}%`}}/></i><b>{s.score}</b></div></td><td>{s.pe}</td><td>+{s.growth}%</td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-screener">No stocks match those filters. Try lowering the AI score.</div>}</div>
          </article>
          <section className="signal-lower-grid"><article className="signal-card catalysts"><div className="card-title"><div><p>CATALYST CALENDAR</p><h2>What could move {selectedStock.symbol}</h2></div></div><div className="catalyst"><time>Aug 27</time><i className="earnings"/><div><b>Quarterly earnings</b><span>EPS consensus $1.01 · High impact</span></div></div><div className="catalyst"><time>Sep 09</time><i/><div><b>Industry conference</b><span>Management presentation · Medium impact</span></div></div><div className="catalyst"><time>Oct 15</time><i/><div><b>Product cycle update</b><span>AI infrastructure roadmap</span></div></div></article><article className="signal-card news-card"><div className="card-title"><div><p>AI NEWS DIGEST</p><h2>Signal-driving headlines</h2></div></div><button><span>12m</span><div><b>Analysts lift estimates on demand</b><small>Sentiment: strongly positive</small></div><Icon name="arrow"/></button><button><span>1h</span><div><b>Institutional flows accelerate</b><small>Sentiment: positive</small></div><Icon name="arrow"/></button><button><span>3h</span><div><b>Options imply elevated volatility</b><small>Sentiment: neutral</small></div><Icon name="arrow"/></button></article></section>
        </div>
        <aside className="signal-insights">
          {prediction?<article className="signal-card prediction-card"><div className="ai-label"><span><Icon name="spark"/></span> VALIDATED MODEL ESTIMATE</div><p className="prediction-language">Model-estimated probabilities based on historical out-of-sample relationships—not certainty.</p><div className="prediction-metrics"><div title="Chance of beating SPY by at least 5 percentage points over 90 trading days"><span>Boom probability</span><strong>{(prediction.boomProbability*100).toFixed(0)}%</strong></div><div title="Chance of a 15% or greater drawdown during the next 90 trading days"><span>Bust risk</span><strong>{(prediction.bustProbability*100).toFixed(0)}%</strong></div><div title="Estimated stock return minus SPY return over 90 trading days"><span>Expected excess return</span><strong>{prediction.expectedExcessReturn>=0?"+":""}{(prediction.expectedExcessReturn*100).toFixed(1)}%</strong></div><div title="Agreement, calibration, available history, and data quality"><span>Confidence</span><strong>{(prediction.confidence*100).toFixed(0)}%</strong></div></div><div className="factor-scores">{Object.entries(prediction.scores).map(([name,value])=><div key={name}><span>{name.replace(/([A-Z])/g," $1")}</span><i><b style={{width:`${value}%`}}/></i><strong>{value.toFixed(0)}</strong></div>)}</div><button className="analysis-button" onClick={()=>setShowAnalysis(!showAnalysis)}>{showAnalysis?"Hide model factors":"Explain this estimate"} <Icon name="arrow"/></button>{showAnalysis&&<div className="expanded-thesis"><b>Top positive factors</b><p>{prediction.factors.positive.join(" · ")||"No strong positive attribution"}</p><b>Top negative factors</b><p>{prediction.factors.negative.join(" · ")||"No strong negative attribution"}</p><small>Model {prediction.modelVersion}</small></div>}</article>:<article className="signal-card prediction-unavailable"><div className="ai-label"><span><Icon name="spark"/></span> PREDICTION ENGINE</div><h2>Validation gate active</h2><p>{predictionStatus}</p><small>Predictions appear only after XGBoost beats the baseline on the untouched holdout and passes calibration checks.</small></article>}
          <article className="signal-card pulse"><div className="card-title"><div><p>MARKET PULSE</p><h2>Sector strength</h2></div></div>{[["Technology",86],["Healthcare",71],["Financials",64],["Consumer",52],["Energy",39]].map(([name,value])=><div className="pulse-row" key={name}><span>{name}</span><i><b style={{width:`${value}%`}}/></i><strong>{value}</strong></div>)}</article>
          <article className="signal-card mini-watchlist" id="signal-watchlist"><div className="card-title"><div><p>YOUR WATCHLIST</p><h2>{watchlist.length} tracked companies</h2></div></div>{stocks.filter(s=>watchlist.includes(s.symbol)).map(s=><button key={s.symbol} onClick={()=>setSelected(s.symbol)}><span><b>{s.symbol}</b><small>{s.name}</small></span><strong>${s.price.toFixed(2)}</strong><em className={s.change>=0?"positive":"negative"}>{s.change>=0?"+":""}{s.change}%</em></button>)}{watchlist.length===0&&<p className="watchlist-empty">Add a company to start tracking it.</p>}</article>
          <div className="disclaimer"><Icon name="spark"/><p><b>Research workspace</b><br/>Demo insights are illustrative, delayed, and not financial advice.</p></div>
        </aside>
      </section>
    </main>
  </div>;
}
