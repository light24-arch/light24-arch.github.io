import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  image: string;
  title: string;
  href: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  interval?: number;
}

export default function HeroCarousel({ slides, interval = 5500 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setProgress(0);
    elapsedRef.current = 0;
  }, []);

  const prev = useCallback(() => {
    goTo((index - 1 + slides.length) % slides.length);
  }, [index, slides.length, goTo]);

  const next = useCallback(() => {
    goTo((index + 1) % slides.length);
  }, [index, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      elapsedRef.current += 50;
      const pct = Math.min((elapsedRef.current / interval) * 100, 100);
      setProgress(pct);
      if (elapsedRef.current >= interval) {
        elapsedRef.current = 0;
        setProgress(0);
        setIndex((prev) => (prev + 1) % slides.length);
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [interval, slides.length]);

  const current = slides[index];

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.06 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: interval / 1000, ease: 'linear' } }}
        >
          <a href={current.href} className="block w-full h-full">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover"
            />
          </a>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* Left / Right click zones */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-0 w-[15%] z-20 flex items-center justify-start pl-6 group cursor-[w-resize]"
        aria-label="上一个项目"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/80">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </span>
      </button>

      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-0 w-[15%] z-20 flex items-center justify-end pr-6 group cursor-[e-resize]"
        aria-label="下一个项目"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/80">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      {/* Text */}
      <div className="absolute inset-0 z-10 flex items-end px-8 lg:px-12 pb-16 lg:pb-20 max-w-[1440px] mx-auto left-0 right-0 pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <a href={current.href} className="block group pointer-events-auto">
                <motion.h1
                  className="text-[clamp(2.25rem,8vw,5rem)] font-medium tracking-[-0.03em] leading-[0.92] text-white group-hover:text-white/80 transition-colors"
                  layout
                >
                  {current.title}
                </motion.h1>
              </a>
            </motion.div>
          </AnimatePresence>
          <div className="lg:text-right lg:pb-4 flex-shrink-0">
            <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-white/50 leading-relaxed">
              建筑 · 空间 · 跨界
              <br />
              作品集 2025
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[1px] bg-white/10">
        <motion.div
          className="h-full bg-white/60"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 right-8 lg:right-12 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
