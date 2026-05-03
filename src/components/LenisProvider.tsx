import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isMobile = !window.matchMedia('(hover: hover)').matches;

    const lenis = new Lenis({
      lerp: isMobile ? 0 : 0.08,
      duration: isMobile ? 0 : 0.8,
      smoothWheel: !isMobile,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
