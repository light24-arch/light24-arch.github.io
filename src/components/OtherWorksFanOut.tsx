import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface ArtworkItem {
  title: string;
  hero: string;
  medium: string;
  year: number | string;
  slug: string;
}

interface OtherWorksFanOutProps {
  items: ArtworkItem[];
}

export default function OtherWorksFanOut({ items }: OtherWorksFanOutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  if (!mounted) return <div className="w-full h-[300vh] bg-white" />;
  if (!items || items.length === 0) return null;

  return (
    <>
      {/* ── Desktop: 3D fan-out (md+) ── */}
      <div ref={containerRef} className="hidden md:block relative w-full h-[300vh]">
        <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
          {/* ══════ 背景文字：14%可见 → 15%瞬间消失 ══════ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <SplitTextHeadline scrollYProgress={scrollYProgress} />
          </div>

          {/* ══════ 卡片容器：perspective 与 flex 分层 ══════ */}
          <div className="relative z-50" style={{ perspective: '1500px' }}>
            <div className="w-full h-full flex items-center justify-center">
            {items.map((item, index) => (
              <Card3DTransformWrapper
                key={item.slug}
                index={index}
                totalCards={items.length}
                scrollYProgress={scrollYProgress}
              >
                <a
                  href={`/artwork/${item.slug}`}
                  className="group/card block w-[260px] h-[360px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)] hover:-translate-y-4 transition-all duration-500 cursor-pointer bg-white border border-stone-100 isolate"
                >
                  <div className="w-full h-full relative overflow-hidden">
                    <img
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
              </Card3DTransformWrapper>
            ))}
            </div>
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
              <img
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

/* ── SplitText：接力时间轴 [0 → 1 → 1 → 0]，15%处瞬间消失 ── */
function SplitTextHeadline({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const textLeftX = useTransform(scrollYProgress, [0, 0.15], [0, -500]);
  const textRightX = useTransform(scrollYProgress, [0, 0.15], [0, 500]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.14, 0.15], [1, 1, 0]);

  return (
    <>
      <motion.span
        style={{ x: textLeftX, opacity: textOpacity }}
        className="text-[12vw] font-black text-stone-100 absolute select-none tracking-tighter"
      >
        OTHER
      </motion.span>
      <motion.span
        style={{ x: textRightX, opacity: textOpacity }}
        className="text-[12vw] font-black text-stone-200/60 absolute select-none tracking-tighter mt-[14vw]"
      >
        WORKS
      </motion.span>
    </>
  );
}

/* ── 3D card engine：14%隐藏 → 15%瞬间实体 → 70%扇形展开 ── */
function Card3DTransformWrapper({
  index,
  totalCards,
  scrollYProgress,
  children,
}: {
  index: number;
  totalCards: number;
  scrollYProgress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const offsetFromCenter = index - (totalCards - 1) / 2;

  /* Stagger per card */
  const stagger = index * 0.03;
  const tEnd = 0.7 + stagger;

  /* ══ 所有3D运动在0.15后触发（无opacity — 用rotateY+scale做空间reveal） ══ */
  const endX = offsetFromCenter * 300;
  const x = useTransform(scrollYProgress, [0.15, tEnd], [0, endX]);

  /* Y — deck stack → release */
  const yStart = (index < 2 ? 1 : -1) * (totalCards - index) * 4;
  const y = useTransform(scrollYProgress, [0.15, tEnd], [yStart, 0]);

  /* Z-depth — from behind screen plane → forward */
  const z = useTransform(scrollYProgress, [0.15, tEnd], [-40, 0]);

  /* rotateY — 72°侧立 → 转正微外旋 (不用90°，避免backface compositing) */
  const rotateY = useTransform(scrollYProgress, [0.15, tEnd], [72, offsetFromCenter * 4]);

  /* rotateZ — 专属倾角 */
  const customZRotations = [-3, 3, -3, 3];
  const rotateZ = useTransform(scrollYProgress, [0.15, tEnd], [0, customZRotations[index]]);

  /* scale — 压缩 → 释放 */
  const scale = useTransform(scrollYProgress, [0.15, tEnd], [0.5, 1]);

  const zIndex = Math.round(50 - Math.abs(offsetFromCenter));

  return (
    <motion.div
      className="absolute origin-center"
      style={{
        x,
        y,
        z,
        scale,
        rotateY,
        rotateZ,
        zIndex,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  );
}
