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
  if (index === 3 || (index > 3 && (index - 3) % 4 === 0)) return 'lg:col-span-2';
  return '';
}

function BentoCard({ item, delay }: { item: BentoItem; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <a href={`/artwork/${item.slug}`} className="group block h-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={spring}
          className="relative h-full overflow-hidden"
        >
          <img
            src={item.hero}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* 底部渐变，保证白色文字可读 */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

          {/* 文字叠加层 */}
          <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 space-y-1">
            <h3 className="text-lg lg:text-xl font-medium tracking-[-0.02em] text-white group-hover:text-white/80 transition-colors duration-300">
              {item.title}
            </h3>
            <p className="text-xs lg:text-sm text-white/65 uppercase tracking-[0.15em]">
              {item.year} · {item.medium}
            </p>
            {item.brief && (
              <p className="text-sm text-white/80 leading-relaxed pt-1 line-clamp-2 lg:line-clamp-3">
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
      {/* Desktop: 16:9 container, 3-col grid fills entire box */}
      <div className="hidden lg:grid grid-cols-3 gap-3 aspect-[16/9] overflow-hidden">
        {items.map((item, i) => (
          <div key={item.slug} className={getSpanClass(i)}>
            <BentoCard item={item} delay={i * 0.12} />
          </div>
        ))}
      </div>

      {/* Mobile: 1:1 cards stacked vertically */}
      <div className="flex flex-col gap-6 lg:hidden">
        {items.map((item, i) => (
          <div key={item.slug} className="aspect-[1/1]">
            <BentoCard item={item} delay={i * 0.12} />
          </div>
        ))}
      </div>
    </>
  );
}
