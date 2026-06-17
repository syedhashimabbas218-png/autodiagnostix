import React, { useState, useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import { breadcrumbListSchema } from '../utils/schema';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import ProductGrid from '../components/ProductGrid';
import GsapReveal from '../components/GsapReveal';
import { getProducts } from '../payloadApi';

export default function AllProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(data => {
                setProducts(data.map(p => ({
                    ...p,
                    image: p.heroImages?.[0] || '',
                    description: p.summary || (p.description?.substring(0, 120) + '...') || '',
                })));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Loading…</div>;

    const breadcrumbs = [
        { name: 'Home', url: 'https://autodiagnostix.com/' },
        { name: 'All Products', url: 'https://autodiagnostix.com/products' },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <SeoHead
                title="All Products"
                description={`Browse all ${products.length} diagnostic products at Autodiagnostix. Shop professional scanners, TPMS tools, and workshop equipment.`}
                canonical="https://autodiagnostix.com/products"
                jsonLd={breadcrumbListSchema(breadcrumbs)}
            />
            <Header />
            <main className="pt-20">
                <header className="bg-surface pt-16 pb-12 px-8 border-b border-outline-variant/10">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">
                            <a className="hover:text-primary transition-colors" href="/">Home</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-primary font-bold">All Products</span>
                        </nav>
                        <GsapReveal direction="up">
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-4">
                                All Products
                            </h1>
                            <p className="text-on-surface-variant text-xl max-w-xl">
                                {products.length} products across all categories. Filter by brand, tag, or search below.
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
