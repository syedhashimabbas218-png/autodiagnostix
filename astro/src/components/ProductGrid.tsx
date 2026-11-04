import { useState, useMemo } from 'react';
import Reveal from './Reveal';

interface GridProduct {
  id: string;
  name: string;
  brand?: string;
  tier?: string;
  badge?: string | null;
  image?: string;
  imageSrcset?: string;
  description?: string;
}

interface Props {
  products: GridProduct[];
  initialSearch?: string;
}

const badgeColor: Record<string, string> = {
  NEW: 'bg-green-600',
  TRENDING: 'bg-amber-500',
};

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-pressed={active}
    className={`shrink-0 inline-flex items-center min-h-[44px] md:min-h-[36px] px-4 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${active ? 'bg-[#97000d] text-white shadow-md' : 'bg-[#eeeeee] text-zinc-700 hover:bg-[#e0e0e0]'}`}
  >
    {label}
  </button>
);

export default function ProductGrid({ products = [], initialSearch = '' }: Props) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeBrand, setActiveBrand] = useState('All');
  const [activeBadge, setActiveBadge] = useState('All');
  const brands = useMemo(() => {
    const s = new Set(products.map(p => p.brand || p.tier || '').filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [products]);

  const badges = useMemo(() => {
    const s = new Set(products.map(p => p.badge).filter(Boolean));
    return ['All', ...Array.from(s).filter(b => b !== 'DISCONTINUED')];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeBrand !== 'All') list = list.filter(p => (p.brand || p.tier) === activeBrand);
    if (activeBadge !== 'All') list = list.filter(p => p.badge === activeBadge);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeBrand, activeBadge, searchTerm]);

  return (
    <div>
      <div className="md:sticky md:top-16 z-30 bg-surface/95 md:backdrop-blur-md border-b border-zinc-200/70 px-4 sm:px-8 py-3 md:py-4">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
          <div className="relative w-full md:w-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6f72]">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#f0f1f1] border border-zinc-300 rounded-full pl-9 pr-4 min-h-[44px] md:min-h-[36px] text-base md:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#97000d]/60 w-full md:w-56 transition-shadow"
            />
          </div>
          {/* Phones: one horizontally scrollable row instead of 2-3 wrapped rows. */}
          <div role="group" aria-label="Filter products" className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap">
            <div className="w-px h-6 bg-zinc-300 hidden md:block" aria-hidden="true" />
            {brands.length > 1 && brands.map(b => (
              <FilterChip key={b} label={b} active={activeBrand === b} onClick={() => setActiveBrand(b)} />
            ))}
            {badges.length > 1 && (
              <>
                <div className="w-px h-6 bg-zinc-300 shrink-0" aria-hidden="true" />
                {badges.map(b => (
                  <FilterChip key={b} label={b} active={activeBadge === b} onClick={() => setActiveBadge(b)} />
                ))}
              </>
            )}
          </div>

        </div>
      </div>
      <div className="bg-[#ececed] py-10 md:py-14 px-4 sm:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="sr-only">Product catalog</h2>
          <p role="status" className="text-xs text-zinc-600 font-bold uppercase tracking-widest mb-6 md:mb-8">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            {activeBrand !== 'All' && ` · ${activeBrand}`}
            {activeBadge !== 'All' && ` · ${activeBadge}`}
          </p>
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-zinc-600 text-xl">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product, idx) => (
                <Reveal key={product.id} delay={Math.min(idx * 0.08, 0.4)} direction="up" className="group bg-[#f9f9f9] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-200 ease-out flex flex-col hover:-translate-y-1">
                  <a href={`/product/${product.id}`} className="flex flex-col flex-grow">
                    <div className="aspect-[4/3] bg-white p-6 flex items-center justify-center relative overflow-hidden">
                      <img alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 ease-out mix-blend-multiply" src={product.image} srcSet={product.imageSrcset} sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" referrerPolicy="no-referrer" loading={idx < 4 ? 'eager' : 'lazy'} fetchPriority={idx === 0 ? 'high' : 'auto'} decoding="async" width="800" height="600" />
                      {product.badge && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className={`${badgeColor[product.badge] || 'bg-zinc-700'} text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm`}>{product.badge}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-1 min-h-[1rem]">{product.brand || product.tier}</p>
                      <h3 className="font-headline text-lg font-bold tracking-tight mb-2 group-hover:text-[#97000d] transition-colors leading-snug">{product.name}</h3>
                      <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">{product.description}</p>
                      <span className="text-[#97000d] font-bold text-sm flex items-center gap-1 mt-auto pt-4 border-t border-[#c4c5c6]/10 group-hover:gap-2 transition-all">
                        View Specs &rarr;
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
              <div className="on-dark bg-[#bb2221] p-8 rounded-2xl flex flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">Pro Support</span>
                  <h3 className="font-headline text-xl font-extrabold tracking-tighter leading-tight mb-3">Need expert advice?</h3>
                  <p className="text-white/80 text-xs leading-relaxed mb-6">Our technicians can evaluate your needs and recommend the right product.</p>
                </div>
                <a href="/contact" className="w-full py-3 bg-white text-[#97000d] font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2">
                  Contact Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
