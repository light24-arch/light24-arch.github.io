import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export default function TextReveal({
  text,
  as = 'p',
  className = '',
  delay = 0,
  duration = 0.8,
  stagger = 0.04,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const lines = text.split('\n');

  const Component = as;

  const container = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const child = {
    hidden: { y: '120%', rotate: 4 },
    visible: {
      y: '0%',
      rotate: 0,
      transition: {
        duration,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden leading-[1.2] pb-[0.08em] -mb-[0.08em]">
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <Component>
              <motion.span
                variants={child}
                className="inline-block"
                style={{ display: 'inline-block' }}
              >
                {line || ' '}
              </motion.span>
            </Component>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
