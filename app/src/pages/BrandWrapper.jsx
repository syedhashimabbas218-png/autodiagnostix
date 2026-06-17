import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { breadcrumbListSchema } from '../utils/schema';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import ProductGrid from '../components/ProductGrid';
import GsapReveal from '../components/GsapReveal';
import { getProducts } from '../payloadApi';

export default function BrandWrapper() {
    const { id } = useParams(); // brand slug e.g. "launch"
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const normalize = str => str?.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

    useEffect(() => {
        setLoading(true);
        getProducts()
            .then(data => {
                const filtered = data.filter(p => normalize(p.brand) === id);
                setProducts(filtered.map(p => ({
                    ...p,
                    image: p.heroImages?.[0] || '',
                    description: p.summary || (p.description?.substring(0, 120) + '...') || '',
                })));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const brandName = products[0]?.brand || decodeURIComponent(id).replace(/-/g, ' ').toUpperCase();

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Loading…</div>;

    const breadcrumbs = [
        { name: 'Home', url: 'https://autodiagnostix.com/' },
        { name: 'Brands', url: 'https://autodiagnostix.com/brands' },
        { name: brandName, url: `https://autodiagnostix.com/brand/${id}` },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <SeoHead
                title={brandName}
                description={`Browse all ${brandName} diagnostic products at Autodiagnostix. ${products.length} products available.`}
                canonical={`https://autodiagnostix.com/brand/${id}`}
                jsonLd={breadcrumbListSchema(breadcrumbs)}
            />
            <Header />
            <main className="pt-20">
                <header className="bg-surface pt-16 pb-10 px-8">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">
                            <a className="hover:text-primary transition-colors" href="/">Home</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <a className="hover:text-primary transition-colors" href="/brands">Brands</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-primary font-bold">{brandName}</span>
                        </nav>
                        <GsapReveal direction="up">
                            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-4">
                                {brandName}
                            </h1>
                            <p className="text-on-surface-variant text-lg max-w-xl">
                                Browse all {brandName} products — filter by badge, sort, and search below.
                            </p>
                        </GsapReveal>
                    </div>
                </header>
                <ProductGrid products={products} />
            </main>
            <Footer />
        </div>
    );
}
