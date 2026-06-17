import React, { useState, useEffect } from 'react';
import GsapReveal from './GsapReveal';
import { Link, useNavigate } from 'react-router-dom';
import homepageData from '../data/homepage-content.json';
import { getProducts } from '../payloadApi';

const IconMap = {
    arrow_forward: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    ),
    verified: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
    ),
    support_agent: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            <path d="M19 22v-3"></path>
            <path d="M12 22v-2"></path>
        </svg>
    ),
    business: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
    ),
    share: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
    ),
    mail: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
    ),
    language: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    )
};

export function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(data => {
                setProducts(data.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading products:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section id="new-arrivals" className="py-24 bg-surface px-8">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
                            PREMIUM SELECTION
                        </span>
                        <h2 className="text-4xl md:text-5xl font-aeonik-bold tracking-tighter text-zinc-900">
                            New Arrivals
                        </h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((product, idx) => (
                        <Link to={`/product/${product.id}`} key={product.id}>
                            <GsapReveal delay={idx * 0.15} direction="up" className="group bg-surface-container-lowest p-8 border border-zinc-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-pointer h-full">
                                <div className="aspect-square bg-zinc-50 mb-8 overflow-hidden relative">
                                    <img
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-200 ease-out mix-blend-multiply"
                                        src={product.heroImages?.[0] || ''}
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase">
                                        New
                                    </span>
                                </div>
                                <h3 className="text-lg font-aeonik-bold tracking-tight mb-2 uppercase">{product.name}</h3>
                                <p className="text-zinc-400 text-xs mb-6 font-medium">{(product.summary || product.description).substring(0, 80)}...</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-900 font-bold">VIEW SPECS</span>
                                    <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center justify-center">
                                        {IconMap.arrow_forward}
                                    </span>
                                </div>
                            </GsapReveal>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Stats() {
    const stats = homepageData.stats_section;
    return (
        <section id="stats" className="py-20 overflow-hidden relative bg-[#FAFAFA] text-zinc-900">
            <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-black/10 pt-16">
                    {stats.achievements.map((item, idx) => (
                        <div key={idx}>
                            <div className={`text-5xl font-aeonik-bold mb-2 ${item.style === 'primary-accent' ? 'text-primary' : ''}`}>
                                {item.value}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{item.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 mb-20">
                    <div className="flex items-center gap-4 mb-12">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{stats.partners.section_title}</span>
                        <div className="h-px flex-1 bg-black/[0.08]"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 items-center opacity-70 filter grayscale hover:grayscale-0 transition-all duration-200 ease-out ease-out">
                        {stats.partners.brands.map(brand => (
                            <span key={brand.name} className="text-xl font-black tracking-tighter text-center text-zinc-900">
                                {brand.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-24 border-t border-black/[0.08] pt-20">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="max-w-xs">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
                                {stats.certifications.section_subtitle}
                            </span>
                            <h2 className="text-3xl font-aeonik-bold tracking-tighter text-zinc-900">
                                {stats.certifications.section_title}.
                            </h2>
                            <p className="mt-4 text-zinc-500 text-sm leading-relaxed">{stats.certifications.description}</p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                            {stats.certifications.items.map(cert => (
                                <div key={cert.name} className="p-6 bg-white border border-black/[0.08] hover:border-primary/20 transition-colors">
                                    <span className="text-primary mb-4 block w-6 h-6">
                                        {IconMap[cert.icon] || <span className="material-symbols-outlined">{cert.icon}</span>}
                                    </span>
                                    <h4 className="text-sm font-aeonik-bold text-zinc-900 mb-1">{cert.name}</h4>
                                    <p className="text-xs text-zinc-500">{cert.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} export function ImmersiveCategories() {
    const navigate = useNavigate();
    const data = homepageData.immersive_categories;
    return (
        <section id="immersive-categories" className="py-12 bg-surface">
            <div className="max-w-screen-2xl mx-auto px-8 space-y-8">
                {/* Diagnostic Scanners Section */}
                <div className="relative h-[600px] bg-zinc-100 overflow-hidden flex items-center">
                    <div className="absolute inset-0">
                        <img alt={data.sections[0].background.alt || "Diagnostic Interface"} className="w-full h-full object-cover" src={data.sections[0].background.image} referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-10 p-16 max-w-xl bg-white/10 backdrop-blur-md border border-white/20 ml-16">
                        <h2 className="text-4xl font-aeonik-bold text-white mb-6">{data.sections[0].title}</h2>
                        <p className="text-white/80 mb-8 leading-relaxed">
                            {data.sections[0].description}
                        </p>
                        <button
                            onClick={() => navigate(data.sections[0].cta.href)}
                            className="bg-white text-zinc-900 px-8 py-3 font-aeonik-medium text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
                        >
                            {data.sections[0].cta.label}
                        </button>
                    </div>
                </div>
                {/* Maintenance Equipment Section */}
                <div className="relative h-[600px] bg-zinc-100 overflow-hidden flex items-center justify-end">
                    <div className="absolute inset-0">
                        <img alt={data.sections[1].background.alt || "Maintenance Bay"} className="w-full h-full object-cover" src={data.sections[1].background.image} referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative z-10 p-16 max-w-xl bg-zinc-950/80 backdrop-blur-md mr-16">
                        <h2 className="text-4xl font-aeonik-bold text-white mb-6">{data.sections[1].title}</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">
                            {data.sections[1].description}
                        </p>
                        <button
                            onClick={() => navigate(data.sections[1].cta.href)}
                            className="primary-gradient text-white px-8 py-3 font-aeonik-medium text-xs uppercase tracking-widest hover:scale-[0.98] transition-all"
                        >
                            {data.sections[1].cta.label}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function WorkshopSolutions() {
    const navigate = useNavigate();
    const data = homepageData.professional_equipment;
    return (
        <section id="professional-equipment" className="py-24 bg-white px-8">
            <div className="max-w-screen-2xl mx-auto">
                <h2 className="text-3xl font-aeonik-bold tracking-tighter mb-12">{data.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {data.categories.map((category, idx) => (
                        <GsapReveal key={category.id} delay={idx * 0.15} direction="up" onClick={() => navigate('/products')} className="group cursor-pointer hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out">
                            <div className="aspect-video bg-surface-container-low mb-6 overflow-hidden">
                                <img alt={category.name} className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-110" src={category.image} referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase text-primary tracking-widest">{category.tagline}</span>
                                <div className="h-px flex-1 bg-zinc-100"></div>
                            </div>
                            <h3 className="text-xl font-aeonik-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">{category.description}</p>
                        </GsapReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function InteractiveLifts() {
    const { content_section } = homepageData.interactive_lifts;

    const liftImages = {
        '2-post': '/images/lift-2post.webp',
        '4-post': '/images/lift-4post.webp',
        'scissor': '/images/lift-scissor.webp',
    };
    const liftSpecs = {
        '2-post': { label: 'Capacity', value: 'UNITE 4 Ton 2-Post Series' },
        '4-post': { label: 'Capacity', value: 'UNITE 4 Ton 4-Post Series' },
        'scissor': { label: 'Capacity', value: 'LIBERTY LIFT – Up to 6.8 Ton' },
    };

    const [activeLift, setActiveLift] = React.useState('2-post');
    const [imgSrc, setImgSrc] = React.useState(liftImages['2-post']);
    const [fade, setFade] = React.useState(true);

    const handleLiftClick = (id) => {
        if (id === activeLift) return;
        setFade(false);
        setTimeout(() => {
            setActiveLift(id);
            setImgSrc(liftImages[id]);
            setFade(true);
        }, 200);
    };

    const spec = liftSpecs[activeLift];

    return (
        <section id="lifts" className="py-24 bg-surface px-8 border-y border-zinc-100">
            <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Image Panel */}
                <div className="relative order-2 lg:order-1 h-[500px] bg-zinc-200 overflow-hidden">
                    <img
                        alt={activeLift + ' lift'}
                        src={imgSrc}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        style={{ opacity: fade ? 1 : 0 }}
                    />
                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 border border-zinc-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">{spec.label}</span>
                        <span className="text-sm font-aeonik-bold text-zinc-900 transition-all duration-300">{spec.value}</span>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="order-1 lg:order-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6 block">{content_section.tagline}</span>
                    <h2 className="text-5xl font-aeonik-bold tracking-tighter text-zinc-900 mb-12 leading-tight">
                        {content_section.title.split('.')[0]}.<br />{content_section.title.split('.')[1]}.
                    </h2>
                    <div className="space-y-4">
                        {content_section.lift_types.map(lift => {
                            const isActive = activeLift === lift.id;
                            return (
                                <div
                                    key={lift.id}
                                    onClick={() => handleLiftClick(lift.id)}
                                    className={`group p-6 bg-white border transition-all duration-200 cursor-pointer select-none
                                        ${isActive ? 'border-primary shadow-sm' : 'border-transparent hover:bg-zinc-50 hover:border-zinc-200'}`}
                                >
                                    <div className={`flex items-start gap-6 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                                        <span className={`text-xl font-aeonik-bold shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-primary'}`}>
                                            {lift.number}
                                        </span>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-aeonik-bold mb-2 transition-colors duration-200 ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                                {lift.name}
                                            </h3>
                                            <p className="text-zinc-500 text-sm leading-relaxed">{lift.description}</p>
                                            {isActive && lift.products && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {lift.products.map(p => (
                                                        <span key={p} className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-1 uppercase tracking-widest font-bold">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`shrink-0 text-zinc-300 transition-all duration-200 ${isActive ? 'text-primary rotate-0' : 'group-hover:text-zinc-400'}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CTABanner() {
    const navigate = useNavigate();
    const data = homepageData.cta_banner;
    return (
        <section id="cta-banner" className="py-24 bg-primary overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white rotate-12 translate-x-1/2"></div>
            </div>
            <div className="max-w-screen-2xl mx-auto px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-aeonik-bold text-white tracking-tighter mb-8">
                    {data.title.split(' ').slice(0, 4).join(' ')} <br /> {data.title.split(' ').slice(4).join(' ')}
                </h2>
                <p className="max-w-2xl mx-auto mb-12 text-lg text-white/80">
                    {data.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(data.cta_primary.href)}
                        className="bg-white text-primary px-10 py-5 font-aeonik-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-colors"
                    >
                        {data.cta_primary.label}
                    </button>
                    <button
                        onClick={() => navigate(data.cta_secondary.href)}
                        className="border border-white/40 text-white px-10 py-5 font-aeonik-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                        {data.cta_secondary.label}
                    </button>
                </div>
            </div>
        </section>
    );
}

export function Footer() {
    const footer = homepageData.footer;
    return (
        <footer className="bg-zinc-50 border-t border-zinc-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full px-8 py-16 max-w-screen-2xl mx-auto">
                <div className="col-span-2 md:col-span-1">
                    <div className="mb-6 h-16 flex items-center">
                        <img src="/logo-full.png" alt={footer.company_info.name} className="h-full w-auto object-contain mix-blend-multiply" />
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mb-8">
                        {footer.company_info.description}
                    </p>
                    <div className="flex gap-4">
                        {footer.company_info.social_icons.map(icon => (
                            <a key={icon} href="#" className="text-zinc-400 hover:text-primary cursor-pointer flex items-center justify-center w-5 h-5">
                                {IconMap[icon] || <span className="material-symbols-outlined">{icon}</span>}
                            </a>
                        ))}
                    </div>
                </div>

                {footer.menu_columns.map(col => (
                    <div key={col.title}>
                        <span className="uppercase text-xs font-bold tracking-widest text-zinc-500 block mb-6">{col.title}</span>
                        <ul className="space-y-4">
                            {col.links.map(link => (
                                <li key={link.label}>
                                    <a className="text-sm text-zinc-500 hover:text-red-600 transition-transform hover:translate-x-1 inline-block" href={link.href}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <span className="uppercase text-xs font-bold tracking-widest text-zinc-500 block mb-6">{footer.newsletter.title}</span>
                    <p className="text-zinc-500 text-[10px] mb-4">{footer.newsletter.description}</p>
                    <div className="flex border-b border-zinc-200 py-2">
                        <input id="newsletter-email" className="bg-transparent border-none text-xs w-full focus:ring-0 px-0 outline-none" placeholder={footer.newsletter.input_placeholder} type="email" />
                        <button
                            onClick={() => {
                                const input = document.getElementById('newsletter-email');
                                if (input?.value) {
                                    window.location.href = `mailto:sales@autodiagnostix.com?subject=Newsletter%20Signup&body=${encodeURIComponent(input.value)}`;
                                    input.value = '';
                                }
                            }}
                            className="text-primary font-bold text-xs uppercase cursor-pointer"
                        >
                            {footer.newsletter.button_text}
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full px-8 py-8 border-t border-zinc-200 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-zinc-400 text-[10px] uppercase tracking-widest">{footer.bottom_bar.copyright}</span>
                <div className="flex gap-8">
                    {footer.bottom_bar.social_links.map(link => (
                        <a key={link.label} href={link.href} className="text-zinc-400 text-[10px] uppercase tracking-widest cursor-pointer hover:text-zinc-900 transition-colors">
                            {link.label}
                        </a>
                    ))}
                    <a href="/admin" className="text-zinc-400 text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-colors">Admin</a>
                </div>
            </div>
        </footer>
    );
}
