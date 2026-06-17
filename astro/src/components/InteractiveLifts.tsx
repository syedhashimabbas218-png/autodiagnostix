import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface LiftType {
  id: string;
  number: string;
  name: string;
  description: string;
  products: string[];
  specifications: Record<string, string>;
}

interface InteractiveLiftsProps {
  image: string;
  title: string;
  tagline: string;
  liftTypes: LiftType[];
}

export default function InteractiveLifts({ image, title, tagline, liftTypes }: InteractiveLiftsProps) {
  const [active, setActive] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.from(contentRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }, [active]);

  useEffect(() => {
    if (!imageRef.current) return;
    gsap.fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, [active]);

  const current = liftTypes[active];

  return (
    <section id="lifts" className="py-24 bg-surface border-y border-zinc-100">
      <div className="max-w-[1536px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={imageRef} className="relative h-[500px] overflow-hidden">
            <img src={image} alt={current?.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-zinc-100 px-6 py-4">
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-400">Model Spec</span>
              <p className="font-headline font-bold text-lg">{current?.specifications?.Capacity || 'UNITE 4 Ton Series'}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 block">{tagline}</span>
            <h2 className="font-headline text-5xl font-extrabold tracking-tighter leading-[1.05] mb-12">{title}</h2>
            <div className="flex gap-6 mb-10">
              {liftTypes.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setActive(i)}
                  className={`pb-3 border-b-2 font-headline font-bold text-lg tracking-tight transition-all ${
                    i === active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {current && (
              <div ref={contentRef} className="space-y-8">
                <div className="border-l-2 border-primary pl-6">
                  <span className="text-xs font-black tracking-wide text-slate-300">{current.number}</span>
                  <h3 className="font-headline text-xl font-bold tracking-tight mb-2">{current.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{current.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    {Object.entries(current.specifications).map(([k, v]) => (
                      <span key={k}><strong className="text-slate-600">{k}:</strong> {v}</span>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-1">
                    {current.products.map((p) => (
                      <li key={p} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
