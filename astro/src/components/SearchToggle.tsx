import { useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  name: string;
  image: string;
  brand: string;
  price: string;
  category: string;
}

export default function SearchToggle() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-500 hover:text-primary transition-colors"
        aria-label="Search products"
        title="Search (Ctrl+K)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 bg-white border border-zinc-200 shadow-2xl overflow-hidden">
            <div className="flex items-center border-b border-zinc-100 px-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 py-5 px-4 text-sm outline-none bg-transparent font-body"
              />
              <kbd className="text-[10px] text-slate-400 border border-zinc-200 px-2 py-0.5 rounded font-mono">ESC</kbd>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {loading && (
                <div className="p-8 text-center text-sm text-slate-400">Searching...</div>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No products found</div>
              )}
              {results.map((p) => (
                <a
                  key={p.id}
                  href={`/product/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0"
                >
                  <div className="w-12 h-12 bg-zinc-50 rounded overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.brand} · {p.category}</p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">{p.price}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
