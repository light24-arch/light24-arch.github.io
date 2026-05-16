import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Section {
  id: string;
  title: string;
}

interface AboutSidebarMenuProps {
  sections: Section[];
}

const ITEM_HEIGHT = 60;

export default function AboutSidebarMenu({ sections }: AboutSidebarMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSelect = (index: number, id: string) => {
    setActiveIndex(index);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── A. 自动轮播 ── */
  useEffect(() => {
    if (isHovered || sections.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sections.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isHovered, setActiveIndex, sections.length]);

  /* ── B. 原生滚轮接管 ── */
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wheelTimeout.current) return;
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 150);

      if (e.deltaY > 0) {
        setActiveIndex((p) => Math.min(sections.length - 1, p + 1));
      } else if (e.deltaY < 0) {
        setActiveIndex((p) => Math.max(0, p - 1));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleNativeWheel);
  }, [mounted, setActiveIndex, sections.length]);

  if (!mounted) return <div className="h-[400px] w-64" />;

  return (
    <div
      ref={containerRef}
      className="relative h-[400px] w-56 lg:w-64 flex flex-col justify-center z-50 mask-vertical-fade"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ background: 'transparent' }}
    >
      <motion.div
        className="relative w-full"
        animate={{
          y: (sections.length / 2 - activeIndex - 0.5) * ITEM_HEIGHT,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {sections.map((section, index) => {
          const isActive = index === activeIndex;
          const distance = Math.abs(index - activeIndex);

          const blurValue = distance === 0 ? 0 : distance * 2.5;
          const opacityValue = distance === 0 ? 1 : Math.max(0.1, 0.6 - distance * 0.15);
          const scaleValue = distance === 0 ? 1 : Math.max(0.7, 0.9 - distance * 0.05);

          return (
            <motion.div
              key={section.id}
              className="h-[60px] flex items-center justify-start cursor-pointer group"
              onClick={() => handleSelect(index, section.id)}
              animate={{
                filter: `blur(${blurValue}px)`,
                opacity: opacityValue,
                scale: scaleValue,
                x: isActive ? -10 : 0,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'left center' }}
            >
              <div className="w-8 flex justify-end pr-3 overflow-hidden">
                <motion.span
                  initial={false}
                  animate={{ x: isActive ? 0 : -20, opacity: isActive ? 1 : 0 }}
                  className="text-black font-black text-xl"
                >
                  &rarr;
                </motion.span>
              </div>
              <span
                className={`text-3xl lg:text-4xl font-black tracking-tighter transition-colors duration-300 ${
                  isActive ? 'text-black' : 'text-gray-300 group-hover:text-gray-500'
                }`}
              >
                {section.title}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
