import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt?: string;
  className?: string;
  speed?: number;
  containerClassName?: string;
}

export default function ParallaxImage({
  src,
  alt = '',
  className = '',
  speed = -0.3,
  containerClassName = '',
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 300]);

  return (
    <div ref={ref} className={`overflow-hidden ${containerClassName}`}>
      <motion.div style={{ y }} className="h-[120%] -top-[10%] relative">
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}
