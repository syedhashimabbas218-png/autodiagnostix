import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GsapReveal from './GsapReveal';

// Must be at module scope — defining inside the parent component causes
// React to treat it as a new type on every render, breaking onClick state
const FilterChip = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${active
            ? 'bg-primary text-white shadow-md'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
    >
        {label}
    </button>
);

const badgeColor = {
    NEW: 'bg-green-600',
    DISCONTINUED: 'bg-red-600',
    TRENDING: 'bg-amber-500',
};

/**
 * Reusable product grid with live filters derived from the product list itself.
 * Filters: brand, badge (NEW / DISCONTINUED / TRENDING), full-text search.
 */
export default function ProductGrid({ products = [] }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(querySearch);
    const [activeBrand, setActiveBrand] = useState('All');
    const [activeBadge, setActiveBadge] = useState('All');
    const [sortOrder, setSortOrder] = useState('default');

    // Derive unique brands from products
    const brands = useMemo(() => {
        const set = new Set(products.map(p => p.brand || p.tier || '').filter(Boolean));
        return ['All', ...Array.from(set).sort()];
    }, [products]);

    // Derive unique badges from products
    const badges = useMemo(() => {
        const set = new Set(products.map(p => p.badge).filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [products]);

    useEffect(() => {
        if (querySearch !== searchTerm) {
            setSearchTerm(querySearch);
        }
    }, [querySearch]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim()) {
            setSearchParams({ search: val });
        } else {
            setSearchParams({});
        }
    };

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
        if (sortOrder === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        if (sortOrder === 'za') list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        return list;
    }, [products, activeBrand, activeBadge, searchTerm, sortOrder]);

    return (
        <div>
            {/* Filter bar */}
            <div className="sticky top-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10 px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="bg-surface-container-low border border-outline-variant/20 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 transition-all"
                        />
                    </div>

                    <div className="w-px h-6 bg-outline-variant/20 hidden md:block" />

                    {/* Brand filters */}
                    {brands.length > 1 && brands.map(b => (
                        <FilterChip key={b} label={b} active={activeBrand === b} onClick={() => setActiveBrand(b)} />
                    ))}

                    {/* Badge filters */}
                    {badges.length > 1 && (
                        <>
                            <div className="w-px h-6 bg-outline-variant/20 hidden md:block" />
                            {badges.map(b => (
                                <FilterChip key={b} label={b} active={activeBadge === b} onClick={() => setActiveBadge(b)} />
                            ))}
                        </>
                    )}

                    {/* Sort */}
                    <div className="ml-auto flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                        <span>Sort:</span>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-on-surface font-bold cursor-pointer outline-none"
                        >
                            <option value="default">Default</option>
                            <option value="az">A → Z</option>
                            <option value="za">Z → A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-surface-container-low py-14 px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Result count */}
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-8">
                        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                        {activeBrand !== 'All' && ` · ${activeBrand}`}
                        {activeBadge !== 'All' && ` · ${activeBadge}`}
                    </p>

                    {filtered.length === 0 ? (
                        <div className="py-24 text-center text-on-surface-variant font-aeonik text-xl">
                            No products match your filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((product, idx) => (
                                <GsapReveal
                                    key={product.id}
                                    delay={Math.min(idx * 0.08, 0.4)}
                                    direction="up"
                                    className="group bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-200 ease-out flex flex-col hover:-translate-y-1"
                                >
                                    <div className="aspect-[4/3] bg-white p-6 flex items-center justify-center relative overflow-hidden">
                                        <img
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 ease-out mix-blend-multiply"
                                            src={product.image}
                                            referrerPolicy="no-referrer"
                                        />
                                        {product.badge && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className={`${badgeColor[product.badge] || 'bg-zinc-700'} text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm`}>
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{product.brand || product.tier}</p>
                                        <h3 className="font-headline text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors leading-snug">{product.name}</h3>
                                        <p className="text-on-surface-variant text-xs leading-relaxed mb-6 flex-grow line-clamp-3">{product.description}</p>
                                        <a
                                            href={`/product/${product.id}`}
                                            className="text-primary font-bold text-sm flex items-center gap-1 group/link mt-auto pt-4 border-t border-outline-variant/10"
                                        >
                                            View Specs
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/link:translate-x-1 transition-transform">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </a>
                                    </div>
                                </GsapReveal>
                            ))}

                            {/* CTA card */}
                            <div className="bg-primary-container p-8 rounded-2xl flex flex-col justify-between text-on-primary-container relative overflow-hidden">
                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">Pro Support</span>
                                    <h3 className="font-headline text-xl font-extrabold tracking-tighter leading-tight mb-3">Need expert advice?</h3>
                                    <p className="text-on-primary-container/80 text-xs leading-relaxed mb-6">Our technicians can evaluate your needs and recommend the right product.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Book Free Demo
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
