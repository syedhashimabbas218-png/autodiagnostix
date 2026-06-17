import React, { useState, useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import { breadcrumbListSchema } from '../utils/schema';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import GsapReveal from '../components/GsapReveal';
import { getProducts } from '../payloadApi';

export default function BrandsPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(data => {
                // Group products by brand
                const brandMap = {};
                data.forEach(p => {
                    const name = p.brand?.trim() || 'Other';
                    if (!brandMap[name]) {
                        brandMap[name] = { name, products: [], image: p.heroImages?.[0] || '' };
                    }
                    brandMap[name].products.push(p);
                });

                // Slug helper
                const toSlug = str => str.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');

                setBrands(
                    Object.values(brandMap)
                        .filter(b => b.name && b.name !== 'Other')
                        .sort((a, b) => b.products.length - a.products.length)
                        .map(b => ({ ...b, slug: toSlug(b.name) }))
                );
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center font-aeonik text-2xl">Loading…</div>;

    const breadcrumbs = [
        { name: 'Home', url: 'https://autodiagnostix.com/' },
        { name: 'Brands', url: 'https://autodiagnostix.com/brands' },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <SeoHead
                title="Brands"
                description="Browse industry-leading diagnostic tool manufacturers at Autodiagnostix. Explore Launch, Autel, and more."
                canonical="https://autodiagnostix.com/brands"
                jsonLd={breadcrumbListSchema(breadcrumbs)}
            />
            <Header />
            <main className="pt-20">
                <header className="bg-surface pt-16 pb-12 px-8 border-b border-outline-variant/10">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6">
                            <a className="hover:text-primary transition-colors" href="/">Home</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-primary font-bold">Brands</span>
                        </nav>
                        <GsapReveal direction="up">
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-4">
                                Our Brands
                            </h1>
                            <p className="text-on-surface-variant text-xl max-w-xl">
                                Industry-leading manufacturers powering professional workshops worldwide.
                            </p>
                        </GsapReveal>
                    </div>
                </header>

                <section className="py-16 px-8 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {brands.map((brand, idx) => (
                            <GsapReveal key={brand.name} delay={idx * 0.1} direction="up">
                                <a
                                    href={`/brand/${brand.slug}`}
                                    className="group block bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="aspect-[16/7] bg-white p-8 flex items-center justify-center relative overflow-hidden">
                                        <img
                                            src={brand.image}
                                            alt={brand.name}
                                            className="max-h-24 max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-headline font-extrabold text-xl tracking-tight group-hover:text-primary transition-colors">{brand.name}</h2>
                                            <p className="text-xs text-on-surface-variant mt-0.5">{brand.products.length} product{brand.products.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                                    </div>
                                </a>
                            </GsapReveal>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
