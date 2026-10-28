import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = !window.matchMedia('(hover: hover)').matches;

    const lenis = new Lenis({
      lerp: isMobile ? 0 : 0.08,
      duration: isMobile ? 0 : 0.8,
      smoothWheel: !isMobile,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
