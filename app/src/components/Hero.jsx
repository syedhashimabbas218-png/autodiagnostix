import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import heroData from '../data/hero-section.json';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = heroData.hero_slides;
    const heroRef = useRef(null);
    const navigate = useNavigate();

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".hero-tagline", { y: 20, opacity: 0, duration: 0.5, ease: "expo.out", delay: 0.1 })
            .from(".hero-title", { y: 30, opacity: 0, scale: 0.95, duration: 0.7, ease: "expo.out" }, "-=0.3")
            .from(".hero-desc", { y: 20, opacity: 0, duration: 0.5, ease: "expo.out" }, "-=0.5")
            .from(".hero-cta", { y: 20, opacity: 0, duration: 0.5, ease: "expo.out", stagger: 0.1 }, "-=0.4");
    }, { scope: heroRef });

    useEffect(() => {
        if (!heroData.slider_config.auto_play) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, heroData.slider_config.interval);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section ref={heroRef} className="relative h-screen w-full flex items-center overflow-hidden bg-zinc-900">
            {slides.map((slide, idx) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-200 ease-out ease-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <div className="absolute inset-0 z-0">
                        <img
                            alt={slide.background.alt}
                            className="w-full h-full object-cover"
                            src={slide.background.image}
                        />
                        <div className="absolute inset-0 bg-black/70"></div>
                    </div>

                    <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full h-full flex items-center">
                        <div className="max-w-2xl">
                            <span className="hero-tagline text-sm uppercase tracking-[0.2em] text-primary font-bold mb-4 block">
                                {slide.tagline}
                            </span>
                            <h1 className="hero-title text-6xl md:text-8xl font-aeonik-bold text-white leading-tight tracking-tighter mb-6">
                                {slide.headline.split('.')[0]}. <br />
                                <span className="text-primary">{slide.highlight_text}</span>
                            </h1>
                            <p className="hero-desc text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                                {slide.description}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate(slide.cta_primary.href)}
                                    className="hero-cta primary-gradient text-white px-8 py-4 font-aeonik-medium text-sm tracking-tight hover:scale-[1.05] active:scale-95 transition-transform duration-200 ease-out shadow-xl shadow-primary/20"
                                >
                                    {slide.cta_primary.label}
                                </button>
                                <button
                                    onClick={() => navigate(slide.cta_secondary.href)}
                                    className="hero-cta border border-white/40 text-white px-8 py-4 font-aeonik-medium text-sm tracking-tight hover:bg-white/10 hover:scale-[1.05] transition-all duration-200 ease-out"
                                >
                                    {slide.cta_secondary.label}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slider Pagination Indicator */}
            <div className="absolute bottom-12 left-8 z-20 flex gap-2">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 w-12 cursor-pointer transition-colors ${idx === currentSlide ? 'bg-primary' : 'bg-white/20'
                            }`}
                        onClick={() => setCurrentSlide(idx)}
                    />
                ))}
            </div>
        </section>
    );
}
