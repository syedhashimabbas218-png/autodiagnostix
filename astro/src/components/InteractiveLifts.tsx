import { useState } from 'react';

interface LiftType {
  id: string;
  number: string;
  name: string;
  description: string;
  products: string[];
}

interface InteractiveLiftsProps {
  image: string;
  title: string;
  tagline: string;
  liftTypes: LiftType[];
}

const liftImages: Record<string, string> = {
  '2-post': '/images/2postlift.webp',
  '4-post': '/images/unite4post.webp',
  'scissor': '/images/scissor-lift.webp',
};

const liftSpecs: Record<string, { label: string; value: string }> = {
  '2-post': { label: 'Model Spec', value: 'TPF-15C 6.8 TON BULLETPROOF' },
  '4-post': { label: 'Capacity', value: 'UNITE 4 Ton 4-Post Series' },
  'scissor': { label: 'Capacity', value: 'LIBERTY LIFT – Up to 6.8 Ton' },
};

export default function InteractiveLifts({ image, title, tagline, liftTypes }: InteractiveLiftsProps) {
  const [activeLift, setActiveLift] = useState('2-post');
  const [imgSrc, setImgSrc] = useState(liftImages['2-post']);
  const [fade, setFade] = useState(true);

  const handleLiftClick = (id: string) => {
    if (id === activeLift) return;
    setFade(false);
    setTimeout(() => {
      setActiveLift(id);
      setImgSrc(liftImages[id] || image);
      setFade(true);
    }, 200);
  };

  const spec = liftSpecs[activeLift] || { label: 'Capacity', value: 'UNITE 4 Ton Series' };

  return (
    <section id="lifts" className="py-24 bg-surface px-8 border-y border-zinc-100">
      <div className="max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative order-2 lg:order-1 h-[300px] md:h-[500px] bg-zinc-200 overflow-hidden">
          <img
            alt={activeLift + ' lift'}
            src={imgSrc}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          />
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 border border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">{spec.label}</span>
            <span className="text-sm font-headline font-bold text-zinc-900 transition-all duration-300">{spec.value}</span>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6 block">{tagline}</span>
          <h2 className="text-5xl font-headline font-extrabold tracking-tighter text-zinc-900 mb-12 leading-tight">
            {title.split('.')[0]}.<br />{title.split('.')[1]}.
          </h2>
          <div className="space-y-4">
            {liftTypes.map(lift => {
              const isActive = activeLift === lift.id;
              return (
                <div
                  key={lift.id}
                  onClick={() => handleLiftClick(lift.id)}
                  className={`group p-6 bg-white border transition-all duration-200 cursor-pointer select-none ${
                    isActive ? 'border-primary shadow-sm' : 'border-transparent hover:bg-zinc-50 hover:border-zinc-200'
                  }`}
                >
                  <div className={`flex items-start gap-6 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                    <span className={`text-xl font-headline font-extrabold shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-primary'}`}>
                      {lift.number}
                    </span>
                    <div className="flex-1">
                      <h3 className={`text-lg font-headline font-bold mb-2 transition-colors duration-200 ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
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
                        <polyline points="9 18 15 12 9 6" />
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
