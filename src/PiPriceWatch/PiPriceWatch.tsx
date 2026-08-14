import { useEffect, useMemo, useState } from "react";
import "./PiPriceWatch.css";

type Listing = {
  id: string;
  name: string;
  memoryGB: number;
  url: string;
  shippable: boolean;
  price: number | null;
  inStock: boolean;
  qualifies: boolean;
  ok: boolean;
  error?: string;
};

type MonitorResponse = {
  checkedAt: string;
  thresholds: Record<"2" | "4", number>;
  results: Listing[];
};

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 10v9h16v-9M3 10l2-6h14l2 6M8 19v-5h4v5M3 10c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
  </svg>
);

function listingStatus(listing: Listing) {
  if (!listing.ok) return { label: "Check failed", kind: "error" };
  if (!listing.shippable) return { label: "Pickup only", kind: "muted" };
  if (!listing.inStock) return { label: "Out of stock", kind: "muted" };
  if (listing.qualifies) return { label: "Deal found", kind: "deal" };
  return { label: "In stock", kind: "stock" };
}

export default function PiPriceWatch() {
  const [data, setData] = useState<MonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memory, setMemory] = useState<"all" | 2 | 4>("all");

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/price-monitor?view=status");
      if (!response.ok) throw new Error(`Price service returned ${response.status}`);
      setData(await response.json());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Prices could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings();
  }, []);

  const filtered = useMemo(
    () =>
      (data?.results || [])
        .filter((item) => memory === "all" || item.memoryGB === memory)
        .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)),
    [data, memory]
  );
  const shippable = filtered.filter((item) => item.ok && item.shippable && item.inStock && item.price !== null);
  const best = shippable.reduce<Listing | null>(
    (winner, item) => (!winner || (item.price ?? Infinity) < (winner.price ?? Infinity) ? item : winner),
    null
  );
  const dealCount = filtered.filter((item) => item.qualifies).length;
  const responding = filtered.filter((item) => item.ok).length;

  return (
    <main className="pi-watch">
      <header className="pi-watch__header">
        <div className="pi-watch__brand">
          <span className="pi-watch__brand-mark"><StoreIcon /></span>
          <span>Pi Price Watch</span>
        </div>
        <button className="pi-watch__refresh" type="button" onClick={() => void loadListings()} disabled={loading}>
          <RefreshIcon /> {loading ? "Checking…" : "Refresh prices"}
        </button>
      </header>

      <section className="pi-watch__hero">
        <div>
          <p className="pi-watch__eyebrow">Raspberry Pi deal monitor</p>
          <h1>Raspberry Pi 4<br /><span>Model B prices.</span></h1>
          <p className="pi-watch__intro">Live board-only listings across seven retailers, checked for stock and shipping availability.</p>
        </div>
        <div className="pi-watch__target" aria-label={`Alert targets are under $${data?.thresholds?.[2] ?? 40} for 2GB and under $${data?.thresholds?.[4] ?? 60} for 4GB`}>
          <span>TEXT ALERT TARGET</span>
          <div className="pi-watch__target-values">
            <strong><b>2GB</b> &lt; ${data?.thresholds?.[2] ?? 40}</strong>
            <strong><b>4GB</b> &lt; ${data?.thresholds?.[4] ?? 60}</strong>
          </div>
          <small>In stock + shippable</small>
        </div>
      </section>

      <section className="pi-watch__metrics" aria-label="Price monitor summary">
        <article><span>Best available</span><strong>{best?.price != null ? `$${best.price.toFixed(2)}` : "—"}</strong><small>{best ? `${best.memoryGB}GB at ${best.name}` : "No shippable stock found"}</small></article>
        <article><span>Deals under target</span><strong>{dealCount}</strong><small>{dealCount ? "Text alert eligible" : "Nothing under target yet"}</small></article>
        <article><span>Sources responding</span><strong>{responding}/{filtered.length}</strong><small>Retail listings checked</small></article>
      </section>

      <section className="pi-watch__panel">
        <div className="pi-watch__panel-head">
          <div>
            <p className="pi-watch__eyebrow">Retailer comparison</p>
            <h2>Current listings</h2>
          </div>
          <div className="pi-watch__filters" aria-label="Filter by memory">
            {(["all", 2, 4] as const).map((value) => (
              <button key={value} type="button" className={memory === value ? "is-active" : ""} onClick={() => setMemory(value)}>
                {value === "all" ? "All models" : `${value}GB`}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="pi-watch__error" role="alert"><strong>Couldn’t load live prices.</strong><span>{error}. The live dashboard works after deployment to Vercel.</span></div>}
        {loading && !data ? <div className="pi-watch__loading" role="status">Checking retailer listings…</div> : (
          <div className="pi-watch__list">
            {filtered.map((listing) => {
              const status = listingStatus(listing);
              return (
                <article className={`pi-watch__listing ${listing.qualifies ? "is-deal" : ""}`} key={listing.id}>
                  <div className="pi-watch__store"><span className="pi-watch__store-icon"><StoreIcon /></span><div><strong>{listing.name}</strong><small>Raspberry Pi 4 Model B</small></div></div>
                  <div className="pi-watch__memory"><span>MEMORY</span><strong>{listing.memoryGB}GB</strong></div>
                  <div className="pi-watch__price"><span>PRICE</span><strong>{listing.price != null ? `$${listing.price.toFixed(2)}` : "Unavailable"}</strong></div>
                  <div className={`pi-watch__status is-${status.kind}`}><i aria-hidden="true" /><span>{status.label}</span></div>
                  <a href={listing.url} target="_blank" rel="noreferrer" aria-label={`Open ${listing.name} ${listing.memoryGB}GB listing`}>View listing <span aria-hidden="true">↗</span></a>
                </article>
              );
            })}
          </div>
        )}
        <footer className="pi-watch__panel-foot">
          <span>{data ? `Last checked ${new Date(data.checkedAt).toLocaleString()}` : "Waiting for first check"}</span>
          <span>Automatic check runs daily</span>
        </footer>
      </section>
    </main>
  );
}
