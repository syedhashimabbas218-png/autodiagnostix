import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import GsapReveal from '../components/GsapReveal';

// We are using the main app Header and Footer for consistency,  
// though the Stitch design had slight variations.

export default function CategoryPage({
    title = "Diagnostic Scanners",
    subtitle = "Professional",
    products = [
        {
            id: "x-431-pro-5",
            name: "X-431 PRO 5",
            description: "Advanced SmartBox 3.0 diagnostic solution with J2534 passthru and remote diagnostics capabilities.",
            tier: "SERIES 5.0",
            badge: "New OEM Spec",
            badgeColor: "bg-tertiary",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQU-OEh-_CRiYtAk8VnyA235mnY9_KJAgoPxhjMg_pe3lizj_gzQgCILHEPg1SihBRhcWX1ZPwrGilAahoUOPYnE1W6u4fdYBSSkmoWOlR9R6dL43NA4SeODUawMz4PyYoHVhvy8RSgyo0EAXXSFKyAGyDOhOnByP0Twsf-E8sTArQwZhUGflQgjpHeFYg_xslyzsVTA2sw3CLJbgFJcQcSRzmZY5fPkgD6vl_mYO9bUsGZ0chpXux09adZD2VrUdg78Z027iuVau1"
        },
        {
            id: "euro-tab-iii",
            name: "EURO TAB III",
            description: "The pinnacle of diagnostic hardware with oscilloscope, simulator, and multimeter integration.",
            tier: "MASTER TIER",
            badge: "Flagship",
            badgeColor: "bg-primary",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1Z7gIx3QscPAAfOKg-E7B0v4RBF6IXoYAef8N4S-NauzC7xreJxWtPNj9FJIwuj4QCOcRTyTD_yDMSd71HeDARa0CEdzRSsSTJMEAYZRAOJTz1cVJSYCXX-5aueWtODoC-So9cmsKPJIsnndUkJQ8wGGvntIJZo7I4ezU1ld_baxHyliBfnZd9Md5wSPjkhvHeHLpJnM-KwqdNeWggzQsvj9DFrKXfpVtTzy5cLHmNkeyeH_uZcupBuF5x1d0w1Hk9WWnCCY5AFRj"
        },
        {
            id: "x-431-pro-s-v5",
            name: "X-431 PRO S V5",
            description: "Ultra-fast 8-inch diagnostic tablet featuring the new V.5.0 software ecosystem for rapid workshops.",
            tier: "ELITE COMPACT",
            badge: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfD9fXiE6fJRFSg9_Ncu_bMA5wY_hucezI7W4vENn4abO45FoOmQzWbpgEk1Y8xWWaThiV4rYJiNoTJvbhHo8dlM6hRrjpSG33ISPi_4ljrPCXvBKcQcucf3O5XAbyLN9r7SYo9wP-ahtlPxXm-QYPlyMYgdON2sHk0GTzl9vqltbm5fNYrdzEzewtJqxg1CB1CSbBNkNpbDtdh9SsCOpbAbCir9paKZ0DDzVh3n0AeF4S2Wy9R_zDU2HuOYp4zsv7hAfuYrb8fCPz"
        },
        {
            id: "crt-511-pro",
            name: "CRT 511 PRO",
            description: "Professional TPMS activation, programming, and relearning tool with full OBDII coverage.",
            tier: "TIRE SERVICE",
            badge: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFk7G_I5aL0ZAOvjpG534BFhV6T8NNymXVMJzN8_a9f23Va1p3nlHZxzOHcprdWvzLp_TwU8KN3Bf9UnphGlROf1AolYhcu4-SNhJTTqyxfKln9FLrIGl8w3jhj03GkCSxJGV8AXUqC5QiZTkiMG6UafBhG9Q3e-PP-94MQugwCCd3X0JhU71R5MIVvFvkhF4Fp-dS52NBSA1FACNHpsde0n6MBdxndnSYznKZiz-Z5Jx1iR_HeSwYlrg3qqYT71ZIncQN9688L3XO"
        },
        {
            id: "x-431-turbo",
            name: "X-431 TURBO",
            description: "The entry-level professional tool for fast service resets and global diagnostic coverage.",
            tier: "FAST SERVICE",
            badge: null,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOsEV15fKdpnwJoohC1uvIKpyFoZ7KStLPihi-Qb4OAM7S8R9WodkX17JqqGjvBTtXjYjXJfaASrOpGy2oB_H0p_qlXpgHVJPWwcO_LmagG7BkvlA1SiwKGwJkw_p7fKDPFw94wODvPOFCg3uQuOYdFoK9e2S0HcmNEZDuJox6TfSEfd8r2OxKqukHCWBSRwRhNNa9-JX5PXNfXMOgfl2ac28tFvFjnFuncwDJ4LtugRRgJL7v_i8IQZ3sUZqrqxyM9om1bxDTQOYz"
        }
    ]
}) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All Scanners');
    const [sortValue, setSortValue] = useState('Latest Arrivals');

    const categories = [
        { name: 'Scanners', icon: 'terminal', slug: 'scanners' },
        { name: 'Lifts', icon: 'foundation', slug: 'lifts' },
        { name: 'ADAS', icon: 'precision_manufacturing', slug: 'adas' },
        { name: 'Tools', icon: 'build_circle', slug: 'tools' },
        { name: 'EV Solutions', icon: 'battery_charging_full', slug: 'ev' },
    ];

    const filters = ['All Scanners', 'Heavy Duty', 'TPMS', 'Software'];

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <Header />
            <main className="pt-20">
                {/* Hero & iPad-inspired Sub-Nav */}
                <header className="bg-surface pt-16 pb-12 px-8">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant mb-8">
                            <a className="hover:text-primary transition-colors" href="/">Home</a>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-primary font-bold">{title}</span>
                        </nav>
                        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-12 max-w-2xl">
                            {subtitle} <br /><span className="text-primary">{title}</span>
                        </h1>

                        <div className="flex overflow-x-auto pb-4 gap-12 no-scrollbar border-b border-outline-variant/20">
                            {categories.map(cat => (
                                <div
                                    key={cat.slug}
                                    onClick={() => navigate(`/category/${cat.slug}`)}
                                    className="flex flex-col items-center gap-2 min-w-fit cursor-pointer group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm group-hover:bg-primary-container group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant group-hover:text-primary">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Product Listing Section */}
                <section className="bg-surface-container-low py-16 px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant mr-4">Filter By:</span>
                                {filters.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === f
                                            ? 'bg-primary-container text-on-primary-container'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                                <span>Sort:</span>
                                <select
                                    value={sortValue}
                                    onChange={e => setSortValue(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-on-surface font-bold cursor-pointer outline-none"
                                >
                                    <option>Latest Arrivals</option>
                                    <option>Price: High to Low</option>
                                    <option>Performance Tier</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {products.map((product, idx) => (
                                <GsapReveal key={product.id} delay={idx * 0.15} direction="up" className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-200 ease-out flex flex-col hover:-translate-y-1 hover:scale-[1.02]">
                                    <div className="aspect-[4/3] bg-white p-8 flex items-center justify-center relative overflow-hidden">
                                        <img alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 ease-out ease-out mix-blend-multiply" src={product.image} referrerPolicy="no-referrer" />
                                        {product.badge && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className={`text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${product.badge === 'NEW' ? 'bg-green-600' :
                                                        product.badge === 'DISCONTINUED' ? 'bg-red-600' :
                                                            'bg-amber-500'
                                                    }`}>
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="font-headline text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{product.description}</p>
                                        <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                                            <span className="text-xs font-bold tracking-widest text-on-surface-variant">{product.tier}</span>
                                            <a className="text-primary font-bold text-sm flex items-center gap-2 group/link" href={`/product/${product.id}`}>
                                                View Specs
                                                <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                                            </a>
                                        </div>
                                    </div>
                                </GsapReveal>
                            ))}

                            {/* Bento-style Promo Card */}
                            <div className="bg-primary-container p-10 rounded-xl flex flex-col justify-between text-on-primary-container relative overflow-hidden">
                                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-6 inline-block">Pro Support</span>
                                    <h3 className="font-headline text-3xl font-extrabold tracking-tighter leading-tight mb-4">Can't decide on the right hardware?</h3>
                                    <p className="text-on-primary-container/80 text-sm leading-relaxed mb-8">Our master technicians are available for a 1-on-1 consultation to evaluate your workshop needs.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full py-4 bg-white text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    Book Free Demo
                                    <span className="material-symbols-outlined">event</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Technical Excellence Section */}
                <section className="py-24 px-8 bg-surface">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 bg-surface-container-high p-12 rounded-2xl flex flex-col justify-center">
                            <span className="material-symbols-outlined text-primary text-5xl mb-6">biotech</span>
                            <h2 className="font-headline text-4xl font-bold tracking-tighter mb-4 text-on-surface">OE-Level Precision</h2>
                            <p className="text-on-surface-variant leading-relaxed">Access dealer-level software functions including online coding, calibrations, and parameter programming across 100+ vehicle brands.</p>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-2xl">
                            <span className="material-symbols-outlined text-tertiary text-4xl mb-4">cloud_sync</span>
                            <h4 className="font-bold mb-2">Live Cloud Updates</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">Daily software updates ensure you have the latest vehicle data before it even hits the independent market.</p>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-2xl">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4">security</span>
                            <h4 className="font-bold mb-2">Secure Gateway</h4>
                            <p className="text-xs text-on-surface-variant leading-relaxed">Authorized access to FCA, Renault, and Mercedes-Benz secure gateways integrated directly into the OS.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
