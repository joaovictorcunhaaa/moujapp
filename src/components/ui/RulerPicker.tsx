import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RulerPickerProps {
  min: number;
  max: number;
  onSelect: (value: number) => void;
  initialValue?: number;
  unit?: string;
}

export const RulerPicker = ({ min, max, onSelect, initialValue, unit }: RulerPickerProps) => {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: 'x',
    // o snap precisa acontecer no centro para precisão
    dragFree: false,
    containScroll: 'keepSnaps',
    align: 'center',
  });

  const [selectedValue, setSelectedValue] = useState(initialValue || min);

  const items = Array.from({ length: (max - min) * 10 + 1 }, (_, i) => min + i / 10);

  const onSelectSnap = useCallback(() => {
    if (!embla) return;
    const snapIndex = embla.selectedScrollSnap();
    const newValue = items[snapIndex];
    setSelectedValue(newValue);
    onSelect(newValue);
  }, [embla, items, onSelect]);

  useEffect(() => {
    if (!embla) return;
    embla.on('select', onSelectSnap);
    embla.on('reInit', onSelectSnap);
    onSelectSnap();
    return () => {
      embla.off('select', onSelectSnap);
      embla.off('reInit', onSelectSnap);
    };
  }, [embla, onSelectSnap]);

  useEffect(() => {
    if (embla && initialValue) {
      const initialIndex = items.findIndex(item => Math.abs(item - initialValue) < 0.05);
      if (initialIndex !== -1) {
        embla.scrollTo(initialIndex, true);
        // Seleciona imediatamente o valor visível
        const selected = items[initialIndex];
        setSelectedValue(selected);
        onSelect(selected);
      }
    }
  }, [embla, items, initialValue, onSelect]);

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="text-5xl font-bold">
        {selectedValue.toFixed(1)} {unit}
      </div>
      <div className="relative w-full overflow-hidden" ref={viewportRef}>
        <div className="flex items-end h-24">
          {items.map((value, index) => {
            const isMajorTick = index % 10 === 0;
            const isHalfTick = index % 5 === 0;
            return (
              <div key={index} className="flex flex-col items-center justify-end flex-shrink-0 w-2.5 h-full">
                <div
                  className={`bg-gray-300 dark:bg-gray-600 transition-all duration-200 ${isMajorTick ? 'h-12 w-0.5' : isHalfTick ? 'h-8 w-0.5' : 'h-4 w-px'}`}>
                </div>
                {isMajorTick && <span className="text-xs mt-2">{value.toFixed(0)}</span>}
              </div>
            );
          })}
        </div>
        {/* Controles de navegação (setas esquerda/direita) */}
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => embla?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full border bg-background/70 hover:bg-accent hover:text-accent-foreground shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Próximo"
          onClick={() => embla?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full border bg-background/70 hover:bg-accent hover:text-accent-foreground shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {/* Marcador central visual */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-white/5 dark:bg-black/5" />
        <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-primary/40" />
      </div>
      <div className="bg-black text-white dark:bg-white dark:text-black text-xs rounded-full px-2 py-1 -mt-4 self-center">
        {selectedValue.toFixed(1)} {unit}
      </div>
    </div>
  );
};