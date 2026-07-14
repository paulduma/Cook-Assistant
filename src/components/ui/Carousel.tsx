import { useRef } from 'react';
import { Icon } from './Icon';

export function Carousel({
  children,
  slideWidth = 300,
}: {
  children: React.ReactNode[];
  slideWidth?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * (slideWidth + 14), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className="shrink-0 snap-start" style={{ width: slideWidth }}>
            {child}
          </div>
        ))}
      </div>
      {children.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Précédent"
            onClick={() => scrollByCard(-1)}
            className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-cream border border-line text-ink hover:bg-ink hover:text-creamlight cursor-pointer"
          >
            <Icon name="arrowLeft" size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={() => scrollByCard(1)}
            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-cream border border-line text-ink hover:bg-ink hover:text-creamlight cursor-pointer"
          >
            <Icon name="arrowLeft" size={15} strokeWidth={2} className="rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}
