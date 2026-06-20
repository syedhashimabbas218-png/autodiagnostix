import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function Reveal({ children, delay = 0, direction = 'up', className = '' }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = container.current;
    if (!el) return;

    const yOffset = direction === 'up' ? 80 : direction === 'down' ? -80 : 0;
    const xOffset = direction === 'left' ? 80 : direction === 'right' ? -80 : 0;

    gsap.set(el, { opacity: 0, y: yOffset, x: xOffset, scale: 0.96 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.6,
          delay,
          ease: 'expo.out',
          overwrite: 'auto',
        });
      },
    });
  }, { scope: container });

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
