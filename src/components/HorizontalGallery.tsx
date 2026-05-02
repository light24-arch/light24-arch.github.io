import { useRef } from 'react';

interface HorizontalGalleryProps {
  images: string[];
  aspect?: string;
}

export default function HorizontalGallery({ images, aspect }: HorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aspectClass = !aspect || aspect === 'auto' ? '' : (aspect.startsWith('aspect-') ? aspect : `aspect-[${aspect}]`);

  return (
    <div ref={containerRef} className="relative overflow-x-auto overflow-y-hidden">
      <div className="flex" style={{ width: `${images.length * 100}%` }}>
        {images.map((src, i) => (
          <div
            key={i}
            className={`flex-shrink-0 ${aspectClass}`}
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={src}
              alt={`图片 ${i + 1}`}
              className="w-full h-full object-cover block"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-1 text-white/50 text-[0.625rem] uppercase tracking-[0.2em]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M5 3l4 4-4 4" />
        </svg>
        滑动查看
      </div>
    </div>
  );
}
