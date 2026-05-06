import { useRef, useState } from 'react';
import FadeIn from './FadeIn';

interface ArtworkCardProps {
  hero: string;
  title: string;
  medium: string;
  year: number | string;
  slug: string;
  delay: number;
}

export default function ArtworkCard({ hero, title, medium, year, slug, delay }: ArtworkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: cy * -6, y: cx * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <FadeIn delay={delay}>
      <a href={`/artwork/${slug}`} className="group block">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.6s ease-out' : 'none',
          }}
        >
          <div className="overflow-hidden aspect-[3/4] mb-4 rounded-2xl shadow-card transition-shadow duration-500 group-hover:shadow-card-hover">
            <img
              src={hero}
              alt={title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-105"
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-xl font-medium">{title}</p>
        <p className="text-sm uppercase tracking-[0.15em] text-text-tertiary mt-1">
          {year} · {medium}
        </p>
      </a>
    </FadeIn>
  );
}
