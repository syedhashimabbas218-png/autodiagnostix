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
    const yOffset = direction === 'up' ? 80 : direction === 'down' ? -80 : 0;
    const xOffset = direction === 'left' ? 80 : direction === 'right' ? -80 : 0;

    gsap.from(container.current, {
      y: yOffset,
      x: xOffset,
      opacity: 0,
      scale: 0.96,
      duration: 0.6,
      delay,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: container.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: container });

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
