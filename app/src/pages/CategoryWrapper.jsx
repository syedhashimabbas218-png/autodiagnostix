import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { breadcrumbListSchema } from '../utils/schema';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import ProductGrid from '../components/ProductGrid';
import GsapReveal from '../components/GsapReveal';
import { getProducts, getCategories } from '../payloadApi';

export default function CategoryWrapper() {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([getCategories(), getProducts()]).then(([cats, allProds]) => {
            const currentCat = cats.find(c => c.id === id);
            setCategory(currentCat);

            const filtered = allProds.filter(p => {
                const catSlug = (p.category || '').toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
                return catSlug === id || p.category === id || p.category?.toLowerCase() === id.replace(/-/g, ' ');
            });

            setProducts(filtered.map(p => ({
                ...p,
                image: p.heroImages?.[0] || '',
                description: p.summary || (p.description?.substring(0, 120) + '...') || '',
            })));
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching category data:', err);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Loading Category…</div>;
    if (!category) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Category Not Found</div>;

    const breadcrumbs = category ? [
        { name: 'Home', url: 'https://autodiagnostix.com/' },
        { name: category.name, url: `https://autodiagnostix.com/category/${id}` },
    ] : [];

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <SeoHead
                title={category?.name}
                description={`Browse ${products.length} professional ${category?.name || 'diagnostic'} products at Autodiagnostix. Filter by brand, badge, or search.`}
                canonical={`https://autodiagnostix.com/category/${id}`}
                jsonLd={breadcrumbListSchema(breadcrumbs)}
            />
            <Header />
            <main className="pt-20">
                <header className="bg-surface pt-16 pb-12 px-8 border-b border-outline-variant/10">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">
                            <a className="hover:text-primary transition-colors" href="/">Home</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-primary font-bold">{category.name}</span>
                        </nav>
                        <GsapReveal direction="up">
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-4">
                                {category.name}
                            </h1>
                            <p className="text-on-surface-variant text-xl max-w-xl">
                                {products.length} product{products.length !== 1 ? 's' : ''} — filter by brand, badge, or search.
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
