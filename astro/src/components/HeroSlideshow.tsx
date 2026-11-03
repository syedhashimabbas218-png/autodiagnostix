import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import useReducedMotion from './useReducedMotion';

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

// Reuse the existing same-dimension WebP encodings; retain the source assets.
const heroImageUrl = (image: string) => image.replace(/\/hero-slide-([123])\.png$/, '/hero-slide-$1.webp');

export default function HeroSlideshow({ slides, interval = 6000 }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState([0]);
  const slideRequest = useRef(0);
  const goToSlide = useCallback(async (index: number) => {
    const request = ++slideRequest.current;
    // Decode before crossfading: no initial competition with the LCP image,
    // and no blank background when a visitor selects an unloaded slide.
    const image = new Image();
    image.fetchPriority = 'low';
    image.src = heroImageUrl(slides[index].background.image);
    await image.decode().catch(() => {});
    if (request !== slideRequest.current) return;
    setLoadedSlides(previous => previous.includes(index) ? previous : [...previous, index]);
    setCurrentSlide(index);
  }, [slides]);
  useEffect(() => () => { slideRequest.current++; }, []);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tl = gsap.timeline();
    tl.fromTo('.hero-tagline', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', delay: 0.1 })
      .fromTo('.hero-title', { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, '-=0.3')
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.5')
      .fromTo('.hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.1 }, '-=0.4');
  }, { scope: heroRef });

  useEffect(() => {
    if (reducedMotion || paused || slides.length < 2) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      void goToSlide((currentSlide + 1) % slides.length);
    }, interval);
    return () => clearInterval(id);
  }, [slides.length, interval, reducedMotion, paused, currentSlide, goToSlide]);

  return (
    <section ref={heroRef} aria-label="Featured products" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} className="hero-slideshow relative h-screen w-full flex items-center overflow-hidden bg-zinc-900">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          aria-hidden={idx !== currentSlide}
          inert={idx !== currentSlide}
          className={`absolute inset-0 transition-opacity duration-[800ms] ease-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="absolute inset-0 z-0">
            {loadedSlides.includes(idx) && <img alt={slide.background.alt} className="w-full h-full object-cover" src={heroImageUrl(slide.background.image)} fetchPriority={idx === 0 ? 'high' : 'low'} decoding="async" width="1024" height="576" />}
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full h-full flex items-center">
            <div className="min-w-0 max-w-2xl w-full">
              <span className="hero-tagline text-sm uppercase tracking-[0.2em] text-[#97000d] font-bold mb-4 block">
                {slide.tagline}
              </span>
              <h2 className="hero-title text-6xl md:text-8xl font-headline font-extrabold text-white leading-tight tracking-tighter mb-6">
                {slide.headline.split('.')[0]}. <br />
                <span className="text-[#97000d]">{slide.highlight_text}</span>
              </h2>
              <p className="hero-desc text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href={slide.cta_primary.href}
                  className="hero-cta bg-[linear-gradient(135deg,#97000d_0%,#bb2221_100%)] text-white px-6 sm:px-8 py-3 sm:py-4 font-headline font-medium text-xs sm:text-sm tracking-tight hover:scale-[1.05] active:scale-95 transition-transform duration-200 ease-out shadow-xl shadow-[#97000d]/20 cursor-pointer"
                >
                  {slide.cta_primary.label}
                </a>
                <a
                  href={slide.cta_secondary.href}
                  className="hero-cta border border-white/40 text-white px-6 sm:px-8 py-3 sm:py-4 font-headline font-medium text-xs sm:text-sm tracking-tight hover:bg-white/10 hover:scale-[1.05] transition-all duration-200 ease-out cursor-pointer"
                >
                  {slide.cta_secondary.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 z-20 flex gap-1.5 md:gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            aria-pressed={idx === currentSlide}
            className={`h-1 w-6 md:w-12 cursor-pointer transition-colors ${idx === currentSlide ? 'bg-[#97000d]' : 'bg-white/20'}`}
            onClick={() => void goToSlide(idx)}
          />
        ))}
      </div>
    </section>
  );
}
