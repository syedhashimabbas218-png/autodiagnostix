import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/HomeComponents';
import GsapReveal from '../components/GsapReveal';

export default function ProductPage({
    title = "LAUNCH PAD 9 LINK",
    tagline = "Professional Grade Diagnostics",
    description = "Advanced vehicle intelligence. Seamless cloud communication. The ultimate precision tool for the modern technician.",
    heroImages = [],
    features = [],
    specs = [],
    badge = null
}) {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen relative pb-32">
            <Header />
            <main className="pt-20">
                <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface-container-lowest">
                    <GsapReveal delay={0.2} direction="up" className="max-w-4xl mx-auto w-full mt-16">
                        <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-surface-container-high rounded-full text-on-surface-variant font-label">
                            {tagline}
                        </span>
                        <h1 className="text-6xl md:text-8xl font-aeonik font-extrabold tracking-tighter text-on-surface leading-[0.9] mb-8">
                            {title}
                            {badge && (
                                <span className={`ml-4 align-middle text-xs px-3 py-1 rounded-full text-white font-black tracking-widest ${badge === 'NEW' ? 'bg-green-600' :
                                    badge === 'DISCONTINUED' ? 'bg-red-600' :
                                        'bg-amber-500'
                                    }`}>
                                    {badge}
                                </span>
                            )}
                        </h1>
                        <p className="text-xl md:text-2xl font-aeonik text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
                            {description}
                        </p>
                        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mt-12 mb-16 group bg-white shadow-sm border border-black/5">
                            <div
                                className="flex transition-transform duration-200 ease-out ease-out ease-in-out h-full"
                                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                            >
                                {heroImages.map((img, index) => (
                                    <div key={index} className="w-full h-full flex-shrink-0">
                                        <img className="w-full h-full object-contain p-8 mix-blend-multiply" src={img} alt={`${title} - ${index + 1}`} referrerPolicy="no-referrer" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent pointer-events-none"></div>

                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/50 border border-black/10 backdrop-blur-md flex items-center justify-center text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>

                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/50 border border-black/10 backdrop-blur-md flex items-center justify-center text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {heroImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-200 ease-out ${currentImageIndex === index ? 'bg-primary w-6' : 'bg-black/20 w-2 hover:bg-black/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </GsapReveal>
                </section>

                {features.map((feat, idx) => (
                    <section key={idx} className={`py-32 px-6 md:px-24 ${feat.bg}`}>
                        <GsapReveal delay={0.2} direction={feat.reverse ? 'left' : 'right'} className={`max-w-7xl mx-auto flex flex-col items-center gap-20 ${feat.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                            <div className={`w-full ${feat.image ? 'md:w-1/2' : 'md:w-full'}`}>
                                <h2 className="text-5xl font-aeonik font-bold tracking-tight text-on-surface mb-8 leading-tight">
                                    {feat.title}<br /><span className="text-primary">{feat.highlight}</span>
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                    {feat.description}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {feat.points.map((point, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10">
                                            <span className="material-symbols-outlined text-primary mb-4">{feat.icons[i]}</span>
                                            <div className="font-aeonik font-bold">{point}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {feat.image && (
                                <div className="w-full md:w-1/2">
                                    <img className="rounded-3xl w-full aspect-square object-cover premium-shadow hover:scale-[1.02] transition-transform duration-200 ease-out ease-out" src={feat.image} alt={feat.title} referrerPolicy="no-referrer" />
                                </div>
                            )}
                        </GsapReveal>
                    </section>
                ))}

                <section className="py-32 px-6 bg-surface-container-lowest">
                    <GsapReveal delay={0.2} direction="up" className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-16">
                            <h2 className="text-4xl font-aeonik font-extrabold tracking-tighter">TECHNICAL SPECIFICATIONS</h2>
                            <span className="text-primary font-aeonik font-bold tracking-widest text-xs">MODEL: {title}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-outline-variant/20 border border-outline-variant/20 rounded-xl overflow-hidden">
                            {specs.map((spec, i) => (
                                <div key={i} className="bg-surface-container-lowest p-10 flex flex-col gap-4">
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{spec.label}</span>
                                    <div className="text-2xl font-aeonik font-medium">{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    </GsapReveal>
                </section>
            </main>

            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                <div className="max-w-7xl mx-auto h-24 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block">
                            <h3 className="font-aeonik font-bold text-lg text-on-surface">{title}</h3>
                            <p className="text-xs text-slate-500 font-label tracking-wide">{tagline}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">verified</span>
                            <span className="text-sm font-aeonik font-medium text-slate-700">OEM Licensed Standards</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.open('/downloads/technical-sheet.pdf', '_blank')}
                            className="hidden md:flex items-center gap-2 text-slate-600 font-aeonik font-medium hover:text-on-surface transition-colors mr-4"
                        >
                            <span className="material-symbols-outlined">download</span> Technical Sheet
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-primary-container text-white px-8 h-12 rounded-full font-aeonik font-bold text-sm uppercase tracking-[0.1em] shadow-xl hover:-translate-y-1 transition-all hover:scale-105 active:scale-95 duration-200 ease-out"
                        >
                            Request a Quote
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
