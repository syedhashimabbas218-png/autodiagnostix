import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GsapReveal({ children, delay = 0, direction = 'up', className = '' }) {
    const container = useRef(null);

    useGSAP(() => {
        const yOffset = direction === 'up' ? 80 : direction === 'down' ? -80 : 0;
        const xOffset = direction === 'left' ? 80 : direction === 'right' ? -80 : 0;

        gsap.from(container.current, {
            y: yOffset,
            x: xOffset,
            opacity: 0,
            scale: 0.96,
            duration: 0.6,
            delay: delay,
            ease: "expo.out",
            scrollTrigger: {
                trigger: container.current,
                start: "top 85%", // Trigger when element hits 85% down viewport
                toggleActions: "play none none none", // Only play forwards once to avoid jitter when quickly scrolling
            }
        });
    }, { scope: container });

    return (
        <div ref={container} className={className}>
            {children}
        </div>
    );
}
