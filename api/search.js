const cache = globalThis.__coogleSearchCache || new Map();
globalThis.__coogleSearchCache = cache;
const usage = globalThis.__coogleSearchUsage || { day: "", count: 0, minute: [] };
globalThis.__coogleSearchUsage = usage;

function reserveRequest() {
  const now=Date.now(), day=new Date(now).toISOString().slice(0,10);
  if (usage.day!==day) { usage.day=day; usage.count=0; }
  usage.minute=usage.minute.filter(time=>now-time<60_000);
  const daily=Math.min(900,Math.max(1,Number(process.env.BRAVE_SEARCH_DAILY_LIMIT)||900));
  if (usage.count>=daily || usage.minute.length>=10) return false;
  usage.count+=1; usage.minute.push(now); return true;
}

export default async function handler(req,res) {
  if (req.method!=="GET") { res.setHeader("Allow","GET"); return res.status(405).json({error:"Method not allowed"}); }
  const query=String(req.query.q||"").trim();
  if (!query || query.length>200) return res.status(400).json({error:"Enter a search between 1 and 200 characters"});
  if (process.env.BRAVE_SEARCH_ENABLED!=="true" || !process.env.BRAVE_SEARCH_API_KEY) return res.status(503).json({error:"Real web search is not configured"});
  const key=query.toLowerCase(), cached=cache.get(key);
  if (cached && Date.now()-cached.savedAt<10*60_000) return res.status(200).json(cached.data);
  if (!reserveRequest()) return res.status(429).json({error:"Coogle search safety limit reached. Try again later."});
  try {
    const params=new URLSearchParams({q:query,count:"10",country:"us",search_lang:"en",safesearch:"moderate",spellcheck:"1"});
    const response=await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`,{headers:{Accept:"application/json","X-Subscription-Token":process.env.BRAVE_SEARCH_API_KEY}});
    const body=await response.json();
    if (!response.ok) return res.status(response.status===429?429:502).json({error:body.message||"Search provider error"});
    const data={query,results:(body.web?.results||[]).map(item=>({title:item.title,url:item.url,description:item.description||"",age:item.age||null})),spellcheck:body.query?.altered||null};
    cache.set(key,{savedAt:Date.now(),data}); res.setHeader("Cache-Control","s-maxage=600, stale-while-revalidate=3600"); return res.status(200).json(data);
  } catch (error) { console.error("Coogle search failed",error); return res.status(502).json({error:"Unable to retrieve web results"}); }
}
