import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  heroImages: string[];
}

export default function NewArrivals({ products = [] }: { products?: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (products.length === 0) return;
    gsap.set('.new-arrival-card', { y: 40, opacity: 0 });
    gsap.to('.new-arrival-card', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
    });
  }, { scope: sectionRef, dependencies: [products] });

  if (products.length === 0) return null;

  return (
    <section ref={sectionRef} id="new-arrivals" className="py-24 bg-surface px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              PREMIUM SELECTION
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-zinc-900">
              New Arrivals
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, idx) => (
            <a href={`/product/${product.id}`} key={product.id} className="new-arrival-card group bg-surface-container-lowest p-8 border border-zinc-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-pointer h-full flex flex-col no-underline">
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
              <h3 className="text-lg font-headline font-bold tracking-tight mb-2 uppercase">{product.name}</h3>
              <p className="text-zinc-400 text-xs mb-6 font-medium">{(product.summary || product.description).substring(0, 80)}...</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-zinc-900 font-bold">VIEW SPECS</span>
                <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
