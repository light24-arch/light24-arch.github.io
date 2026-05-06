import { motion } from 'framer-motion';
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

function getSpanClass(index: number): string {
  if (index === 0) return 'lg:col-span-2 lg:row-span-2';
  // every 4th item after index 3 gets wide treatment
  if (index === 3 || (index > 3 && (index - 3) % 4 === 0)) return 'lg:col-span-2';
  return '';
}

function BentoCard({
  item,
  delay,
  spanClass,
}: {
  item: BentoItem;
  delay: number;
  spanClass: string;
}) {
  return (
    <FadeIn delay={delay}>
      <a href={`/artwork/${item.slug}`} className="group block h-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={spring}
          className="h-full rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-500 hover:shadow-lg overflow-hidden"
        >
          <div className="overflow-hidden aspect-[1/1] lg:aspect-[16/9]">
            <img
              src={item.hero}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-4 lg:p-5 space-y-1">
            <h3 className="text-lg lg:text-xl font-medium tracking-[-0.02em] group-hover:text-text-secondary transition-colors duration-300">
              {item.title}
            </h3>
            <p className="text-xs lg:text-sm text-text-tertiary uppercase tracking-[0.15em]">
              {item.year} · {item.medium}
            </p>
            {item.brief && (
              <p className="text-sm text-text-secondary leading-relaxed pt-2 line-clamp-3">
                {item.brief}
              </p>
            )}
          </div>
        </motion.div>
      </a>
    </FadeIn>
  );
}

export default function BentoGrid({ items }: BentoGridProps) {
  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: 3-col dynamic grid — auto-scales with any number of items */}
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {items.map((item, i) => (
          <div key={item.slug} className={getSpanClass(i)}>
            <BentoCard item={item} delay={i * 0.12} spanClass={getSpanClass(i)} />
          </div>
        ))}
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-10 lg:hidden">
        {items.map((item, i) => (
          <BentoCard key={item.slug} item={item} delay={i * 0.12} spanClass="" />
        ))}
      </div>
    </>
  );
}
