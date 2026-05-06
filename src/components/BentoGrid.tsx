import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from './FadeIn';

interface BentoItem {
  title: string;
  year: number | string;
  medium: string;
  brief?: string;
  hero: string;
  slug: string;
}

interface BentoGridProps {
  items: BentoItem[];
}

const spring = { type: 'spring' as const, stiffness: 200, damping: 25, mass: 0.3 };

function BentoCard({
  item,
  aspect,
  showBrief,
  delay,
}: {
  item: BentoItem;
  aspect: string;
  showBrief: boolean;
  delay: number;
}) {
  const [hover, setHover] = useState(false);

  return (
    <FadeIn delay={delay}>
      <a
        href={`/artwork/${item.slug}`}
        className="group block h-full"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={spring}
          className="relative h-full rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-500 hover:shadow-md overflow-hidden"
        >
          {/* Image */}
          <div className={`overflow-hidden ${aspect}`}>
            <img
              src={item.hero}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Metadata */}
          <div className="p-4 lg:p-5 space-y-1">
            <h3 className="text-lg lg:text-xl font-medium tracking-[-0.02em] group-hover:text-text-secondary transition-colors duration-300">
              {item.title}
            </h3>
            <p className="text-xs lg:text-sm text-text-tertiary uppercase tracking-[0.15em]">
              {item.year} · {item.medium}
            </p>
            {showBrief && item.brief && (
              <p className="text-sm text-text-secondary leading-relaxed pt-2 line-clamp-3">
                {item.brief}
              </p>
            )}
          </div>

          {/* Hover overlay for cells without persistent brief */}
          {!showBrief && item.brief && (
            <AnimatePresence>
              {hover && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 bg-background/92 backdrop-blur-sm flex items-center justify-center p-6 rounded-2xl z-10"
                >
                  <p className="text-sm text-text-secondary leading-relaxed text-center">
                    {item.brief}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </a>
    </FadeIn>
  );
}

export default function BentoGrid({ items }: BentoGridProps) {
  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: CSS Grid bento layout */}
      <div className="hidden lg:grid gap-5" style={{
        gridTemplateAreas: `
          "hero hero sidebar-top"
          "wide wide sidebar-bottom"
        `,
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
      }}>
        <div className="[grid-area:hero]">
          <BentoCard item={items[0]} aspect="aspect-[3/4]" showBrief delay={0} />
        </div>
        <div className="[grid-area:sidebar-top]">
          <BentoCard item={items[1]} aspect="aspect-[3/4]" showBrief={false} delay={0.12} />
        </div>
        <div className="[grid-area:sidebar-bottom]">
          <BentoCard item={items[2]} aspect="aspect-[3/4]" showBrief={false} delay={0.24} />
        </div>
        <div className="[grid-area:wide]">
          <BentoCard item={items[3]} aspect="aspect-[16/9]" showBrief delay={0.36} />
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-10 lg:hidden">
        {items.map((item, i) => {
          const isWide = i === 3;
          return (
            <BentoCard
              key={item.slug}
              item={item}
              aspect={isWide ? 'aspect-[16/9]' : 'aspect-[3/4]'}
              showBrief
              delay={i * 0.12}
            />
          );
        })}
      </div>
    </>
  );
}
