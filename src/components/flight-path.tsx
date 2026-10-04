import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";

type FlightPathProps = {
  /** Códigos de aeropuerto que se leen sobre la ruta, en orden de vuelo. */
  codes?: string;
  className?: string;
};

/**
 * Franja con la ruta de vuelo trazándose: el motivo gráfico de DIAGHU.
 * Los códigos van en HTML (no dentro del SVG) para que se lean igual de
 * bien en móvil, y los extremos son puntos HTML para que la línea se
 * estire sin deformarlos.
 */
export function FlightPath({ codes = "PAP · YUL · MIA · MAD", className }: FlightPathProps) {
  return (
    <div className={cn("border-y border-gold/15 bg-navy", className)}>
      <div className="mx-auto max-w-6xl px-6 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:tracking-[0.28em]">
          {codes}
        </p>
        <div className="relative mt-4 h-8" aria-hidden="true">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 40"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 32 L1200 8"
              stroke="#C9A84C"
              strokeWidth="1"
              strokeDasharray="6 8"
              opacity="0.35"
            />
            <path
              d="M0 32 L1200 8"
              stroke="#E7C77B"
              strokeWidth="2"
              className="draw-line"
              style={{ animationDelay: "300ms" }}
            />
          </svg>
          <span className="absolute top-[80%] left-0 size-2.5 -translate-y-1/2 rounded-full bg-gold" />
          <span className="absolute top-[20%] right-0 size-3 -translate-y-1/2 rounded-full bg-gold2" />
          <Plane
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gold2 animate-[fly-across_4s_ease-in-out_infinite]"
            style={{
              animationDelay: "1.5s",
            }}
            size={20}
          />
        </div>
      </div>
    </div>
  );
}
