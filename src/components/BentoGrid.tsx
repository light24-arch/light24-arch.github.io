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

function getSpan(index: number): { col: number; row: number } {
  if (index === 0) return { col: 2, row: 2 };
  if (index === 3 || (index > 3 && (index - 3) % 4 === 0)) return { col: 2, row: 1 };
  return { col: 1, row: 1 };
}

function getSpanClass(index: number): string {
  const { col, row } = getSpan(index);
  const classes: string[] = [];
  if (col === 2) classes.push('lg:col-span-2');
  if (row === 2) classes.push('lg:row-span-2');
  return classes.join(' ');
}

/** Simulate CSS Grid auto-placement to compute total rows for explicit track sizing */
function computeRows(count: number): number {
  const COLS = 3;
  const grid: boolean[][] = []; // grid[r][c]
  let maxR = 0;

  const occupies = (r: number, c: number, rs: number, cs: number) => {
    for (let dr = 0; dr < rs; dr++)
      for (let dc = 0; dc < cs; dc++)
        if (grid[r + dr]?.[c + dc]) return true;
    return false;
  };

  const mark = (r: number, c: number, rs: number, cs: number) => {
    for (let dr = 0; dr < rs; dr++) {
      if (!grid[r + dr]) grid[r + dr] = [];
      for (let dc = 0; dc < cs; dc++) grid[r + dr][c + dc] = true;
    }
  };

  for (let i = 0; i < count; i++) {
    const { col: cs, row: rs } = getSpan(i);
    let placed = false;
    for (let r = 0; !placed; r++) {
      for (let c = 0; c <= COLS - cs && !placed; c++) {
        if (!occupies(r, c, rs, cs)) {
          mark(r, c, rs, cs);
          maxR = Math.max(maxR, r + rs);
          placed = true;
        }
      }
    }
  }
  return maxR;
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
      {/* Desktop: 16:9 container, 3-col grid with explicit row tracks */}
      <div
        className="hidden lg:grid grid-cols-3 gap-3 aspect-[16/9] overflow-hidden"
        style={{ gridTemplateRows: `repeat(${computeRows(items.length)}, 1fr)` }}
      >
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
