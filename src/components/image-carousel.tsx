import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1645969725362-3353993c9fe1?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1743251173770-a2fa43789eeb?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602003355524-184dbe828b18?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509856124-a6a83c5cd829?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1787293419975-0ad9b077a5e7?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1629221731259-4f0760e3ee89?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1730916335854-bfeb88c3be10?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618298363483-e31a31f1a1e2?w=600&auto=format&fit=crop&q=80"
];

export function ImageCarousel({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10", className)}>
      {/* Imágenes */}
      <div className="relative h-full w-full">
        {CAROUSEL_IMAGES.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Imagen ${index + 1} del carrusel`}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        aria-label="Imagen anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        aria-label="Siguiente imagen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex ? "w-6 bg-gold2" : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
