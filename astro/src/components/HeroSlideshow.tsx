import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface Slide {
  id: number;
  tagline: string;
  headline: string;
  highlight_text: string;
  description: string;
  cta_primary: { label: string; href: string };
  cta_secondary: { label: string; href: string };
  background: { image: string; alt: string };
}

interface Props {
  slides: Slide[];
  interval?: number;
}

export default function HeroSlideshow({ slides, interval = 6000 }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-tagline', { y: 20, opacity: 0, duration: 0.5, ease: 'expo.out', delay: 0.1 })
      .from('.hero-title', { y: 30, opacity: 0, scale: 0.95, duration: 0.7, ease: 'expo.out' }, '-=0.3')
      .from('.hero-desc', { y: 20, opacity: 0, duration: 0.5, ease: 'expo.out' }, '-=0.5')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.1 }, '-=0.4');
  }, { scope: heroRef });

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  return (
    <section ref={heroRef} className="relative h-screen w-full flex items-center overflow-hidden bg-zinc-900">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[800ms] ease-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="absolute inset-0 z-0">
            <img alt={slide.background.alt} className="w-full h-full object-cover" src={slide.background.image} />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full h-full flex items-center">
            <div className="max-w-2xl">
              <span className="hero-tagline text-sm uppercase tracking-[0.2em] text-[#97000d] font-bold mb-4 block">
                {slide.tagline}
              </span>
              <h1 className="hero-title text-6xl md:text-8xl font-headline font-extrabold text-white leading-tight tracking-tighter mb-6">
                {slide.headline.split('.')[0]}. <br />
                <span className="text-[#97000d]">{slide.highlight_text}</span>
              </h1>
              <p className="hero-desc text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => window.location.href = slide.cta_primary.href}
                  className="hero-cta bg-[linear-gradient(135deg,#97000d_0%,#bb2221_100%)] text-white px-6 sm:px-8 py-3 sm:py-4 font-headline font-medium text-xs sm:text-sm tracking-tight hover:scale-[1.05] active:scale-95 transition-transform duration-200 ease-out shadow-xl shadow-[#97000d]/20 cursor-pointer"
                >
                  {slide.cta_primary.label}
                </button>
                <button
                  onClick={() => window.location.href = slide.cta_secondary.href}
                  className="hero-cta border border-white/40 text-white px-6 sm:px-8 py-3 sm:py-4 font-headline font-medium text-xs sm:text-sm tracking-tight hover:bg-white/10 hover:scale-[1.05] transition-all duration-200 ease-out cursor-pointer"
                >
                  {slide.cta_secondary.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 z-20 flex gap-1.5 md:gap-2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 w-6 md:w-12 cursor-pointer transition-colors ${idx === currentSlide ? 'bg-[#97000d]' : 'bg-white/20'}`}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
    </section>
  );
}
