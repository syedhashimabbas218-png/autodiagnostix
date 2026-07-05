import { useState, useEffect, useRef } from 'react';

interface GalleryImage {
  id: number;
  url: string;
  alt?: string;
}

interface Props {
  images: GalleryImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    intervalRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % images.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length, paused]);

  if (images.length === 0) return null;

  const goTo = (idx: number) => setActive((idx + images.length) % images.length);

  return (
    <section
      className="bg-surface py-10 md:py-12"
      aria-label={`${productName} gallery`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3">
            <span className="block w-8 h-px bg-primary" aria-hidden="true"></span>
            Gallery
          </span>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tighter text-on-surface">
            Product Images
          </h2>
        </div>

        <div className="relative bg-white rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
          <div className="relative aspect-[16/10] md:aspect-[16/9]">
            {images.map((img, idx) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.alt || `${productName} image ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-contain p-8 md:p-12 mix-blend-multiply transition-opacity duration-500 ease-out ${idx === active ? 'opacity-100' : 'opacity-0'}`}
                loading={idx === 0 ? 'eager' : 'lazy'} width="800" height="600" />
            ))}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-outline-variant/20 text-on-surface flex items-center justify-center shadow-md transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white border border-outline-variant/20 text-on-surface flex items-center justify-center shadow-md transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 px-4 border-t border-outline-variant/20 bg-surface-container-lowest">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    idx === active ? 'w-10 bg-primary' : 'w-6 bg-outline-variant/40 hover:bg-outline-variant/60'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                  aria-current={idx === active}
                />
              ))}
              <span className="ml-3 text-xs font-bold text-slate-500 tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
