import { FormEvent, useEffect, useRef, useState } from "react";
import "./Coogle.css";

const suggestions = ["How does the stock market work?", "Best hiking trails near Los Angeles", "Learn React from scratch", "Why is the sky blue?"];
const destinations = [
  { name: "YouTube", domain: "youtube.com", href: "https://www.youtube.com", description: "Watch and share videos, music, live streams, tutorials, and more." },
  { name: "Google", domain: "google.com", href: "https://www.google.com", description: "Search the web with Google." },
  { name: "Reddit", domain: "reddit.com", href: "https://www.reddit.com", description: "Explore communities, conversations, news, and recommendations." },
  { name: "Wikipedia", domain: "wikipedia.org", href: "https://www.wikipedia.org", description: "The free encyclopedia." },
  { name: "GitHub", domain: "github.com", href: "https://github.com", description: "Build, share, and discover software." },
  { name: "Amazon", domain: "amazon.com", href: "https://www.amazon.com", description: "Shop products, books, electronics, and everyday essentials." },
  { name: "Netflix", domain: "netflix.com", href: "https://www.netflix.com", description: "Watch movies, television shows, and original series." },
  { name: "Instagram", domain: "instagram.com", href: "https://www.instagram.com", description: "Share photos, videos, and messages." },
  { name: "Facebook", domain: "facebook.com", href: "https://www.facebook.com", description: "Connect with friends, family, groups, and communities." },
  { name: "X", domain: "x.com", href: "https://x.com", description: "See what is happening and join public conversations." },
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>;
}

function Coogle() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem("coogle-recent") || "[]"));
  const inputRef = useRef<HTMLInputElement>(null);
  const [webResults, setWebResults] = useState<Array<{ source:string; title:string; description:string; href:string }>>([]);
  const [searchState, setSearchState] = useState("");

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") { event.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    if (!submitted) { setWebResults([]); setSearchState(""); return; }
    const controller=new AbortController(); setSearchState("Searching the live web…");
    fetch(`/api/search?q=${encodeURIComponent(submitted)}`,{signal:controller.signal}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||body.message||"Web search failed");return body}).then(body=>{
      const items=body.results||body.web?.results||[];
      setWebResults(items.map((item:{title:string;url:string;description?:string})=>({source:new URL(item.url).hostname.replace(/^www\./,""),title:item.title,description:item.description||"",href:item.url})));
      setSearchState(items.length?"":"No live web results found");
    }).catch(error=>{if(error.name!=="AbortError"){setWebResults([]);setSearchState(error.message)}});
    return()=>controller.abort();
  },[submitted]);

  const search = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setQuery(clean); setSubmitted(clean);
    const next = [clean, ...recent.filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecent(next); localStorage.setItem("coogle-recent", JSON.stringify(next));
    window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(clean)}`);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); search(query); };
  const encoded = encodeURIComponent(submitted);
  const normalizedQuery = submitted.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const directMatches = destinations.filter(site => site.name.toLowerCase() === normalizedQuery || site.domain === normalizedQuery || site.domain.replace(".com", "").replace(".org", "") === normalizedQuery || site.name.toLowerCase().includes(normalizedQuery)).map(site => ({ source: site.name, title: `${site.name} — Official site`, description: site.description, href: site.href }));
  const fallbackResults = [
    { source: "Web", title: `Search the web for “${submitted}”`, description: "Explore broad web results, pages, images, videos, and current information.", href: `https://www.google.com/search?q=${encoded}` },
    { source: "Wikipedia", title: `${submitted} — encyclopedia results`, description: "Find background, definitions, history, references, and related topics.", href: `https://en.wikipedia.org/w/index.php?search=${encoded}` },
    { source: "YouTube", title: `Videos about ${submitted}`, description: "Watch explainers, tutorials, reviews, interviews, and documentaries.", href: `https://www.youtube.com/results?search_query=${encoded}` },
    { source: "Reddit", title: `Discussions about ${submitted}`, description: "Read community conversations, personal experiences, and recommendations.", href: `https://www.reddit.com/search/?q=${encoded}` },
    { source: "GitHub", title: `Code related to ${submitted}`, description: "Discover public repositories, examples, libraries, and developer projects.", href: `https://github.com/search?q=${encoded}` },
  ];
  const results = submitted ? [...directMatches,...webResults.filter(result=>!directMatches.some(match=>new URL(match.href).hostname===new URL(result.href).hostname)),...fallbackResults.filter(result=>!directMatches.some(match=>match.href===result.href)&&!webResults.some(match=>match.href===result.href))] : [];

  return <main className={`coogle ${submitted ? "has-results" : ""}`}>
    <header className="coogle-header"><button className="coogle-wordmark mini" onClick={() => { setSubmitted(""); setQuery(""); }}>Coogle<span>.</span></button><nav><a href="https://images.google.com" target="_blank" rel="noreferrer">Images</a><a href="https://news.google.com" target="_blank" rel="noreferrer">News</a><button className="coogle-apps" aria-label="Coogle apps"><i/><i/><i/><i/><i/><i/><i/><i/><i/></button><button className="coogle-avatar" aria-label="User menu">JC</button></nav></header>
    <section className="coogle-search-area">
      {!submitted && <><p className="coogle-eyebrow">THE WEB, WITHOUT THE CLUTTER</p><h1 className="coogle-wordmark">Coogle<span>.</span></h1><p className="coogle-tagline">One search. The right place to keep looking.</p></>}
      <form className="coogle-search" onSubmit={submit}><SearchIcon/><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} aria-label="Search Google with Coogle" placeholder="Search Google" autoComplete="off"/><kbd>/</kbd><button type="submit">Search Google</button></form>
      {!submitted && <div className="coogle-actions"><button onClick={() => search(query)}>Coogle Search</button><button onClick={() => search(suggestions[Math.floor(Math.random()*suggestions.length)])}>I’m Feeling Curious</button></div>}
    </section>
    {!submitted && <section className="coogle-discovery" aria-label="Search suggestions"><div><span>Try searching</span>{suggestions.slice(0,3).map(item => <button key={item} onClick={() => search(item)}>{item}</button>)}</div>{recent.length > 0 && <div><span>Recent</span>{recent.map(item => <button key={item} onClick={() => search(item)}>{item}</button>)}<button className="clear" onClick={() => { setRecent([]); localStorage.removeItem("coogle-recent"); }}>Clear history</button></div>}</section>}
    {submitted && <section className="coogle-results"><div className="result-tabs"><button className="active">All</button><a href={`https://www.google.com/search?tbm=isch&q=${encoded}`} target="_blank" rel="noreferrer">Images</a><a href={`https://news.google.com/search?q=${encoded}`} target="_blank" rel="noreferrer">News</a><a href={`https://www.youtube.com/results?search_query=${encoded}`} target="_blank" rel="noreferrer">Videos</a></div><p className={`result-count ${searchState.startsWith("Searching")?"loading":""}`}>{searchState||`${webResults.length} live web results`}</p>{results.map(result => <article key={result.href}><div className="result-source"><span>{result.source[0]?.toUpperCase()}</span><div><b>{result.source}</b><small>{new URL(result.href).hostname}</small></div></div><a href={result.href} target="_blank" rel="noreferrer">{result.title}</a><p>{result.description}</p></article>)}</section>}
    <footer><span>Coogle is an independent interface demo.</span><div><a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="noreferrer">Privacy</a><a href="https://www.google.com/intl/en/policies/terms/" target="_blank" rel="noreferrer">Terms</a></div></footer>
  </main>;
}

export default Coogle;
