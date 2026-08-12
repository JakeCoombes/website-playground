import artifact from "../ml/artifacts/current-predictions.json" with { type: "json" };

const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/;

export default function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method not allowed" }); }
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  if (!artifact.validationPassed) return res.status(503).json({ error: "No prediction model has passed out-of-sample validation", validationPassed: false });
  const symbol=String(req.query.symbol||"").trim().toUpperCase();
  if (req.query.top === "true") return res.status(200).json({ generatedAt:artifact.generatedAt,modelVersion:artifact.modelVersion,predictions:[...artifact.predictions].sort((a,b)=>b.boomProbability-a.boomProbability) });
  if (!SYMBOL_PATTERN.test(symbol)) return res.status(400).json({ error:"A valid symbol is required" });
  const prediction=artifact.predictions.find(item=>item.symbol===symbol);
  return prediction ? res.status(200).json(prediction) : res.status(404).json({ error:"No validated prediction is available for this symbol" });
}
