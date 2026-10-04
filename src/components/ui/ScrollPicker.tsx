import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollPickerProps {
  items: (string | number)[];
  onSelect: (item: string | number) => void;
  initialItem?: string | number;
}

export const ScrollPicker = ({ items, onSelect, initialItem }: ScrollPickerProps) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'y',
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => {
    if (embla) embla.scrollTo(index);
  }, [embla]);

  useEffect(() => {
    if (initialItem && items.includes(initialItem)) {
      const initialIndex = items.indexOf(initialItem);
      setSelectedIndex(initialIndex);
      scrollTo(initialIndex);
      // Garantir seleção imediata do item visível
      onSelect(items[initialIndex]);
    }
  }, [initialItem, items, scrollTo, onSelect]);

  // Atualiza seleção sempre que o carrossel selecionar um snap
  const onSelectSnap = useCallback(() => {
    if (!embla) return;
    const newIndex = embla.selectedScrollSnap();
    setSelectedIndex(newIndex);
    onSelect(items[newIndex]);
  }, [embla, items, onSelect]);

  useEffect(() => {
    if (!embla) return;
    // Dispara atualização ao iniciar, re-inicializar e sempre que a seleção mudar
    embla.on('select', onSelectSnap);
    embla.on('reInit', onSelectSnap);
    onSelectSnap();
    return () => {
      embla.off('select', onSelectSnap);
      embla.off('reInit', onSelectSnap);
    };
  }, [embla, onSelectSnap]);

  return (
    <div className="relative h-48 w-full overflow-hidden" ref={viewportRef}>
      <div className="flex flex-col h-full">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-center min-h-0 flex-shrink-0 h-12 text-2xl transition-opacity duration-200 ${selectedIndex === index ? 'opacity-100 font-bold' : 'opacity-30'}`}>
            {item}
          </div>
        ))}
      </div>
      {/* Controles de navegação (setas) */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => embla?.scrollPrev()}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full border bg-background/70 hover:bg-accent hover:text-accent-foreground shadow-sm"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => embla?.scrollNext()}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full border bg-background/70 hover:bg-accent hover:text-accent-foreground shadow-sm"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      {/* Marcador central para destacar seleção */}
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-white/5 dark:bg-black/5" />
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-primary/40" />
    </div>
  );
};