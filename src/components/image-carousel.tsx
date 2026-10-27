import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MediaType = 'image' | 'video';

export interface MediaItem {
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
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/34782571/",
    alt: "Facturación en aeropuerto"
  },
  {
    type: 'video',
    url: "https://www.pexels.com/es-es/download/video/29305358/",
    alt: "Viaje internacional"
  }
];

export function ImageCarousel({ className, media = CAROUSEL_MEDIA }: { className?: string; media?: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [media]);

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
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const lightboxGoToPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const lightboxGoToNext = () => {
    setLightboxIndex((prev) => (prev + 1) % media.length);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  useEffect(() => {
    if (lightboxOpen) {
      resetZoom();
    }
  }, [lightboxOpen, lightboxIndex]);

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10", className)}>
      {/* Media (imágenes y videos) */}
      <div className="relative h-full w-full">
        {media.map((media, index) => (
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
                className="h-full w-full object-cover cursor-pointer"
                loading={index === currentIndex ? "eager" : "lazy"}
                onClick={() => openLightbox(index)}
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
        {media.map((media, index) => (
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={closeLightbox}>
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={lightboxGoToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={lightboxGoToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Controles de zoom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Reducir zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="text-white text-sm font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Aumentar zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                disabled={zoomLevel === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Restablecer zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            <img
              src={media[lightboxIndex]?.url}
              alt={media[lightboxIndex]?.alt || `Imagen ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
