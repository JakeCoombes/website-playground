const THRESHOLDS = {
  2: Number(process.env.PRICE_MONITOR_2GB_THRESHOLD || 40),
  4: Number(process.env.PRICE_MONITOR_4GB_THRESHOLD || 60),
};
const USER_AGENT =
  "Mozilla/5.0 (compatible; PersonalPriceMonitor/1.0; +https://vercel.com)";

const PRODUCTS = [
  ["pishop-2gb", "PiShop.us", 2, "https://www.pishop.us/product/raspberry-pi-4-model-b-2gb/", true],
  ["pishop-4gb", "PiShop.us", 4, "https://www.pishop.us/product/raspberry-pi-4-model-b-4gb/", true],
  ["vilros-2gb", "Vilros", 2, "https://vilros.com/products/raspberry-pi-4-model-b-1", true, 40809478717534],
  ["vilros-4gb", "Vilros", 4, "https://vilros.com/products/raspberry-pi-4-model-b-1", true, 40809478750302],
  ["canakit-2gb", "CanaKit", 2, "https://www.canakit.com/raspberry-pi-4-2gb.html", true],
  ["canakit-4gb", "CanaKit", 4, "https://www.canakit.com/raspberry-pi-4-4gb.html", true],
  ["adafruit-2gb", "Adafruit", 2, "https://www.adafruit.com/product/4292", true],
  ["adafruit-4gb", "Adafruit", 4, "https://www.adafruit.com/product/4296", true],
  ["microcenter-2gb", "Micro Center", 2, "https://www.microcenter.com/product/621439/raspberry-pi-4-model-b-2gb-ddr4", false],
  ["microcenter-4gb", "Micro Center", 4, "https://www.microcenter.com/product/637834/raspberry-pi-4-model-b-4gb-ddr4", false],
  ["sparkfun-2gb", "SparkFun", 2, "https://www.sparkfun.com/raspberry-pi-4-model-b-2gb.html", true],
  ["sparkfun-4gb", "SparkFun", 4, "https://www.sparkfun.com/raspberry-pi-4-model-b-4gb.html", true],
  ["central-2gb", "Central Computers", 2, "https://www.centralcomputer.com/raspberry-pi-4-model-b-2gb-ram-board.html", true],
  ["central-4gb", "Central Computers", 4, "https://www.centralcomputer.com/raspberry-pi-4-model-b-4gb-ram-board.html", true],
].map(([id, name, memoryGB, url, shippable, variantId]) => ({
  id, name, memoryGB, url, shippable, variantId,
  dataUrl: variantId ? "https://vilros.com/products/raspberry-pi-4-model-b-1.js" : undefined,
  variant: new RegExp(`^${memoryGB}GB / Board Only$`, "i"),
}));

function cleanText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonLd(html) {
  const products = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      const value = JSON.parse(match[1]);
      const queue = Array.isArray(value) ? [...value] : [value];
      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;
        if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
          products.push(item);
        }
        if (Array.isArray(item["@graph"])) queue.push(...item["@graph"]);
      }
    } catch {
      // Some stores emit non-standard JSON-LD; validated text fallbacks run below.
    }
  }
  return products;
}

function priceFromProduct(product) {
  const offers = Array.isArray(product?.offers) ? product.offers : [product?.offers];
  for (const offer of offers) {
    const price = Number(offer?.price ?? offer?.lowPrice);
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

function parsePrice(html, text, products, memoryGB) {
  for (const product of products) {
    const name = String(product?.name || "");
    if (/raspberry\s*pi\s*4(?:\s*model\s*b)?/i.test(name) && new RegExp(`${memoryGB}\\s*gb`, "i").test(name)) {
      const price = priceFromProduct(product);
      if (price) return price;
    }
  }

  const patterns = [
    new RegExp(`(?:Raspberry\\s*Pi\\s*4(?:\\s*Model\\s*B)?[^$]{0,160}?${memoryGB}\\s*GB|${memoryGB}\\s*GB[^$]{0,160}?Board Only)[^$]{0,80}?\\$\\s*([0-9]+(?:\\.[0-9]{2})?)`, "i"),
    /(?:price|final-price|product-price)[^>]{0,160}?(?:content|data-price-amount)=["']([0-9]+(?:\.[0-9]+)?)/i,
    /\$\s*([0-9]+(?:\.[0-9]{2})?)/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(pattern.source.includes("content") ? html : text);
    const price = Number(match?.[1]);
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

function parseAvailability(html, text, products) {
  const offerText = products
    .flatMap((product) => (Array.isArray(product.offers) ? product.offers : [product.offers]))
    .map((offer) => String(offer?.availability || ""))
    .join(" ");
  const combined = `${offerText} ${text.slice(0, 12000)} ${html.slice(0, 12000)}`;
  if (/out\s*of\s*stock|sold\s*out|unavailable|backordered/i.test(combined)) return false;
  return /in\s*stock|instock|add\s*to\s*cart/i.test(combined);
}

async function checkStore(store) {
  try {
    if (store.dataUrl && store.variantId) {
      const dataResponse = await fetch(store.dataUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!dataResponse.ok) throw new Error(`Product data HTTP ${dataResponse.status}`);
      const product = await dataResponse.json();
      const variant = product.variants?.find((item) => Number(item.id) === store.variantId);
      if (!variant || !store.variant.test(String(variant.title))) {
        throw new Error(`Exact ${store.memoryGB}GB board variant was not found`);
      }
      const price = Number(variant.price) / 100;
      const inStock = Boolean(variant.available);
      return {
        ...store,
        price: Number.isFinite(price) ? price : null,
        inStock,
        qualifies: Boolean(store.shippable && inStock && price < THRESHOLDS[store.memoryGB]),
        ok: true,
      };
    }

    const response = await fetch(store.url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const text = cleanText(html);
    const products = parseJsonLd(html);
    const correctProduct =
      /raspberry\s*pi\s*4(?:\s*model\s*b)?/i.test(text) &&
      new RegExp(`${store.memoryGB}\\s*gb`, "i").test(text) &&
      !/compute\s*module\s*4/i.test(text);
    const price = correctProduct ? parsePrice(html, text, products, store.memoryGB) : null;
    const inStock = price !== null && parseAvailability(html, text, products);
    const qualifies = Boolean(store.shippable && inStock && price < THRESHOLDS[store.memoryGB]);
    return { ...store, price, inStock, qualifies, ok: true };
  } catch (error) {
    return { ...store, price: null, inStock: false, qualifies: false, ok: false, error: error.message };
  }
}

async function twilioRequest(path, options = {}) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const username = apiKeySid || sid;
  const password = apiKeySecret || authToken;
  if (!sid || !username || !password) throw new Error("Missing Twilio credentials");
  return fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
      ...(options.headers || {}),
    },
  });
}

async function recentlyAlerted(storeId) {
  const to = process.env.PRICE_MONITOR_SMS_TO;
  const response = await twilioRequest(`/Messages.json?To=${encodeURIComponent(to)}&PageSize=50`);
  if (!response.ok) return false;
  const payload = await response.json();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return (payload.messages || []).some(
    (message) => message.body?.includes(`[PiMonitor:${storeId}]`) && Date.parse(message.date_sent) > cutoff
  );
}

async function sendAlert(result) {
  if (await recentlyAlerted(result.id)) return false;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.PRICE_MONITOR_SMS_TO;
  if (!from || !to) throw new Error("Missing Twilio phone configuration");
  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: `[PiMonitor:${result.id}] Raspberry Pi 4 Model B ${result.memoryGB}GB is $${result.price.toFixed(2)} at ${result.name} and appears in stock for shipping: ${result.url}`,
  });
  const response = await twilioRequest("/Messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`Twilio HTTP ${response.status}: ${await response.text()}`);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const isStatusRequest = req.query?.view === "status";
  if (!isStatusRequest && (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = await Promise.all(PRODUCTS.map(checkStore));
  const checkedAt = new Date().toISOString();

  if (isStatusRequest) {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=300");
    return res.status(200).json({
      ok: true,
      checkedAt,
      thresholds: THRESHOLDS,
      results: results.map(({ id, name, memoryGB, url, shippable, price, inStock, qualifies, ok, error }) => ({
        id, name, memoryGB, url, shippable, price, inStock, qualifies, ok, error,
      })),
    });
  }

  const alerts = [];
  for (const result of results.filter((item) => item.qualifies)) {
    alerts.push({ store: result.name, sent: await sendAlert(result) });
  }

  return res.status(200).json({
    ok: true,
    checkedAt,
    thresholds: THRESHOLDS,
    alerts,
    results: results.map(({ id, name, memoryGB, url, shippable, price, inStock, qualifies, ok, error }) => ({
      id, name, memoryGB, url, shippable, price, inStock, qualifies, ok, error,
    })),
  });
}
