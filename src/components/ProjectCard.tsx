import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectCardProps {
  images: string[];
  slug: string;
  category: string;
  title: string;
  year: number;
  status: string;
  area: string;
  brief: string;
  aspect?: string;
  columns?: string;
  isEven: boolean;
}

const gridCols: Record<string, string> = {
  '7/5': 'lg:grid-cols-[7fr_5fr]',
  '8/4': 'lg:grid-cols-[8fr_4fr]',
  '9/3': 'lg:grid-cols-[9fr_3fr]',
  '6/6': 'lg:grid-cols-[6fr_6fr]',
  '4/8': 'lg:grid-cols-[4fr_8fr]',
};

const cardSpring = {
  type: 'spring' as const,
  stiffness: 160,
  damping: 24,
  mass: 0.4,
};

const slideVariants = {
  enter: {
    opacity: 0,
    scale: 0.97,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.02,
  },
};

export default function ProjectCard({
  images,
  slug,
  category,
  title,
  year,
  status,
  area,
  brief,
  aspect = '4/3',
  columns = '7/5',
  isEven,
}: ProjectCardProps) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: cy * -4, y: cx * 4 });
  };

  const handleMouseLeave = () => {
    setHover(false);
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    setTouchDevice(!window.matchMedia('(hover: hover)').matches);
  }, []);

  const total = images.length;
  const showArrows = total > 1;

  const shift = useCallback(
    (dir: 1 | -1) => (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      e.preventDefault();
      shift(delta < 0 ? 1 : -1)();
    }
  };

  return (
    <a
      href={`/projects/${slug}`}
      onMouseEnter={() => setHover(true)}
      className={`group block grid grid-cols-1 gap-8 lg:gap-32 items-center ${gridCols[columns] || gridCols['7/5']} ${
        !isEven ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* ── Image carousel ── */}
      <div
        className={`relative ${!isEven ? 'lg:order-2' : ''}`}
        ref={imgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.6s ease-out' : 'none',
          }}
        >
          {/* Stacked cards behind */}
          <div className={`relative ${aspect === '1/1' ? 'aspect-[1/1]' : aspect === '5/4' ? 'aspect-[5/4]' : 'aspect-[4/3] lg:aspect-[5/3]'}`}>
            {total > 1 && (
              <>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`s1-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={cardSpring}
                    className="absolute inset-0 -bottom-2 -right-2 rounded-2xl shadow-md rotate-2 z-0 overflow-hidden"
                  >
                    <img
                      src={images[(index + 1) % total]}
                      alt=""
                      className="w-full h-full object-cover opacity-40 transition-all duration-500 group-hover:brightness-105"
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    key={`s2-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={cardSpring}
                    className="absolute inset-0 -bottom-1.5 -right-1.5 rounded-2xl shadow-md -rotate-2 z-[1] overflow-hidden"
                  >
                    <img
                      src={images[(index + 2) % total]}
                      alt=""
                      className="w-full h-full object-cover opacity-50 transition-all duration-500 group-hover:brightness-105"
                      loading="lazy"
                    />
                  </motion.div>
                </AnimatePresence>
              </>
            )}
            {/* Main image */}
            <div className={`relative overflow-hidden bg-[#F0F0F0] shadow-card transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-card-hover rounded-2xl z-[2] w-full h-full`}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={index}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={cardSpring}
                  className="absolute inset-0"
                >
                  <img
                    src={images[index]}
                    alt={`${title} — ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-105"
                    loading="lazy"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <AnimatePresence>
          {showArrows && (
            <>
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                onClick={shift(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-xl border border-white/20 text-black/80 hover:text-black hover:bg-white/90 transition-all duration-300 shadow-sm"
                aria-label="上一张"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                onClick={shift(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-xl border border-white/20 text-black/80 hover:text-black hover:bg-white/90 transition-all duration-300 shadow-sm"
                aria-label="下一张"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block w-1 h-1 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-white scale-125' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Meta ── */}
      <div
        className={`flex flex-col gap-5 ${!isEven ? 'lg:order-1 lg:text-right lg:items-end' : 'lg:items-start'}`}
      >
        <p className="text-[0.625rem] uppercase tracking-[0.2em] text-text-tertiary">
          {category}
        </p>
        <h2 className="text-3xl lg:text-4xl font-medium tracking-[-0.02em] group-hover:text-text-secondary transition-colors">
          {title}
        </h2>
        <p className="text-sm text-text-secondary">
          {year} · {status}{area ? ` · ${area}` : ''}
        </p>
        {brief && (
          <p className="text-sm text-text-secondary leading-relaxed max-w-md lg:max-w-lg pt-1 text-left">
            {brief}
          </p>
        )}
      </div>
    </a>
  );
}
