import ResponsiveImage from './ResponsiveImage';
import { useEffect, useRef } from 'react';

interface ArtworkItem {
  title: string;
  hero: string;
  medium: string;
  year: number | string;
  slug: string;
}

export default function OtherWorksFanOut({ items }: { items: ArtworkItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-otherworks-card]'));
    const words = Array.from(stage.querySelectorAll<HTMLElement>('[data-otherworks-word]'));
    const desktop = window.matchMedia('(min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const reset = () => {
      delete stage.dataset.animated;
      cards.forEach((card) => card.removeAttribute('style'));
      words.forEach((word) => word.removeAttribute('style'));
    };
    const update = () => {
      frame = 0;
      if (!desktop.matches || reducedMotion.matches) {
        reset();
        return;
      }
      stage.dataset.animated = 'true';
      const bounds = stage.getBoundingClientRect();
      const distance = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / distance));
      const cardWidth = cards[0]?.offsetWidth ?? 260;
      const spacing = Math.min(300, (bounds.width - cardWidth - 48) / Math.max(1, cards.length - 1));
      cards.forEach((card, index) => {
        const center = index - (cards.length - 1) / 2;
        const t = Math.min(1, Math.max(0, progress / (0.6 + index * 0.03)));
        // Start face-on and partly spread so every work stays discoverable.
        const x = center * spacing * (0.7 + 0.3 * t);
        const y = Math.abs(center) * 12 * (1 - t);
        const angle = center * (6 - 4 * t);
        const scale = 0.88 + 0.12 * t;
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotateY(${angle}deg) rotateZ(${center * 2}deg) scale(${scale})`;
        card.style.zIndex = String(Math.round(50 - Math.abs(center)));
      });
      words.forEach((word, index) => {
        const t = Math.min(1, progress / 0.25);
        word.style.opacity = String(1 - t);
        word.style.transform = `translateX(${(index ? 1 : -1) * t * 400}px)`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    observer.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('astro:page-load', schedule);
    desktop.addEventListener('change', schedule);
    reducedMotion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('astro:page-load', schedule);
      desktop.removeEventListener('change', schedule);
      reducedMotion.removeEventListener('change', schedule);
      reset();
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <>
      <div ref={stageRef} data-otherworks-stage className="otherworks-stage">
        <div className="otherworks-viewport">
          <div className="otherworks-headline" aria-hidden="true">
            <span data-otherworks-word>OTHER</span>
            <span data-otherworks-word>WORKS</span>
          </div>
          <div className="otherworks-cards">
            {items.map((item, index) => (
              <div key={item.slug} data-otherworks-card>
                <a
                  href={`/artwork/${item.slug}`}
                  className="group/card block w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)] hover:-translate-y-4 transition-all duration-500 cursor-pointer bg-white border border-stone-100 isolate"
                >
                  <div className="w-full h-full relative overflow-hidden">
                    <ResponsiveImage sizes="(min-width: 768px) 260px, 100vw"
                      src={item.hero}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
                        其他作品 {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="text-2xl font-black leading-tight mb-1">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-[0.625rem] uppercase tracking-widest">
                        {item.year} · {item.medium}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ── Mobile: 2×2 grid (< md) ── */}
      <div className="grid grid-cols-2 gap-3 md:hidden px-4 pb-12">
        {items.map((item, i) => (
          <a
            key={item.slug}
            href={`/artwork/${item.slug}`}
            className={`group block rounded-2xl overflow-hidden shadow-md ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[3/4]'}`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <ResponsiveImage sizes="(min-width: 768px) 260px, 100vw"
                src={item.hero}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-white/60 text-[0.5625rem] uppercase tracking-[0.2em] font-bold mb-1">
                  {item.year} · {item.medium}
                </p>
                <h3 className="text-base font-bold leading-tight tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
