import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * Custom category icons. The new SVG icons in /public/images/category-icons/
 * are referenced by their slug so the homepage can simply pass the slug
 * string as the `icon` value.
 */
const CUSTOM_ICONS: Record<string, string> = {
  scanners: '/images/category-icons/scanners.svg',
  'lifts-jacks': '/images/category-icons/lifts-jacks.svg',
  maintenance: '/images/category-icons/maintenance.svg',
  'wheel-alignment': '/images/category-icons/wheel-alignment.svg',
  'wheel-balancers': '/images/category-icons/wheel-balancers.svg',
  'tire-changers': '/images/category-icons/tire-changers.svg',
  'ev-equipment': '/images/category-icons/ev-equipment.svg',
};

const IconMap: Record<string, JSX.Element> = {
  // New image-based category icons. Rendered via mask so we get a
  // clean outline-only look (the SVG's own dark stroke is masked
  // out and replaced with `currentColor`). The mask source is the
  // same SVG; only the alpha channel renders. Result: a single-color
  // outline icon that takes the parent's text color.
  ...Object.fromEntries(
    Object.entries(CUSTOM_ICONS).map(([key, src]) => [
      key,
      <span
        key={key}
        role="img"
        aria-hidden="true"
        className="cat-icon-img w-6 h-6 inline-block"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` } as React.CSSProperties}
      />,
    ])
  ),
  // Legacy Material Symbols names kept for backward compatibility
  qr_code_scanner: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  ),
  vertical_align_top: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 11 12 7 16 11" />
      <line x1="12" y1="7" x2="12" y2="21" />
      <line x1="4" y1="3" x2="20" y2="3" />
    </svg>
  ),
  settings_input_component: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  tire_repair: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  ),
  build: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  car_crash: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H10a2 2 0 0 0-1.6.8L5.7 11.23A2 2 0 0 0 5 12.83V16h3m6 0v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2m-4 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2" />
      <circle cx="6.5" cy="16.5" r="1.5" />
      <circle cx="17.5" cy="16.5" r="1.5" />
    </svg>
  ),
};

const ALL_PRODUCTS_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function CategoryNav({ categories = [] }: { categories?: Category[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (categories.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('.cat-nav-item', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: sectionRef, dependencies: [categories] });

  if (categories.length === 0) return null;

  // Every category stays visible (the old scroll row clipped the last one at
  // laptop widths). "All products" completes the set so rows stay even.
  const tiles = [...categories.map(cat => ({ key: cat.id, href: `/category/${cat.id}`, label: cat.name, icon: IconMap[cat.icon] || IconMap.build }))];
  if (tiles.length % 2 === 1) {
    tiles.push({ key: 'all-products', href: '/products', label: 'All Products', icon: ALL_PRODUCTS_ICON });
  }
  const wideCols = tiles.length === 8 ? '2xl:grid-cols-8' : tiles.length === 6 ? 'xl:grid-cols-6' : '';

  return (
    <section ref={sectionRef} aria-label="Shop by category" className="bg-white border-b border-zinc-100 py-6 md:py-10 relative isolate z-20">
      <ul className={`max-w-site mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 ${wideCols} gap-2 md:gap-3`}>
        {tiles.map(tile => (
          <li key={tile.key} className="cat-nav-item flex relative z-10">
            <a href={tile.href} className="flex items-center gap-3 group w-full min-h-[56px] rounded-xl px-2 sm:px-3 py-2 hover:bg-surface-container-low transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-container group-hover:shadow-lg transition-all duration-200 ease-out shrink-0 relative z-10">
                <span className="text-zinc-600 group-hover:text-white transition-colors flex items-center justify-center">
                  {tile.icon}
                </span>
              </div>
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 transition-colors leading-tight">
                {tile.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
