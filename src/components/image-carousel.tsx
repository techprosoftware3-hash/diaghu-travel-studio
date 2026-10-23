import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MediaType = 'image' | 'video';

interface MediaItem {
  type: MediaType;
  url: string;
  alt?: string;
}

const CAROUSEL_MEDIA: MediaItem[] = [
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/37119474/",
    alt: "Cabina de pasajeros abarrotada"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/35507462/",
    alt: "Cabina de avión con pasajeros"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/5766696/",
    alt: "Gente música avión viaje"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/13606369/",
    alt: "Gente viaje asientos aeronave"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/34739690/",
    alt: "Recorrido interior aeropuerto"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/35904845/",
    alt: "Terminal aeropuerto ocupada"
  }
];

export function ImageCarousel({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_MEDIA.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Pause video when not visible, play when visible
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          console.log('Playing video at index:', index);
          video.play().catch((err) => {
            console.error('Error playing video:', err);
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_MEDIA.length) % CAROUSEL_MEDIA.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_MEDIA.length);
  };

  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  };

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10", className)}>
      {/* Media (imágenes y videos) */}
      <div className="relative h-full w-full">
        {CAROUSEL_MEDIA.map((media, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.alt || `Imagen ${index + 1} del carrusel`}
                className="h-full w-full object-cover"
                loading={index === currentIndex ? "eager" : "lazy"}
              />
            ) : (
              <video
                ref={setVideoRef(index)}
                src={media.url}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                preload={index === currentIndex ? "auto" : "none"}
              />
            )}
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        aria-label="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_MEDIA.map((media, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex ? "w-6 bg-gold2" : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Ir a ${media.type === 'video' ? 'video' : 'imagen'} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
