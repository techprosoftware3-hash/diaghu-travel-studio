import { useTranslation } from "react-i18next";
import { SITE } from "@/lib/site";
import emblem from "@/assets/emblem.png";
import { Plane } from "lucide-react";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gold/15 bg-navy">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={emblem}
              alt="DIAGHU Logo"
              className="h-14 w-14 object-contain"
            />
            <div>
              <div className="font-display text-lg font-bold text-gold2">{t("site.name")}</div>
              <div className="text-[10px] uppercase tracking-widest text-gold/70">
                {t("site.subtitle")}
              </div>
            </div>
          </div>
          <p className="mt-2 max-w-[32ch] text-sm text-muted">
            {t("footer.description")}
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold/60">
            {t("footer.contact")}
          </div>
          <div className="text-ivory/85">{SITE.phoneDisplay}</div>
          <div className="text-ivory/85">{SITE.email}</div>
          <div className="text-ivory/85">{SITE.address}</div>
          <div className="mt-4 flex justify-center">
            <img
              src="https://thumbs.dreamstime.com/b/dinero-de-vuelta-garant%C3%ADa-la-insignia-confianza-dise%C3%B1o-vectorial-garantizado-marca-logotipo-226409666.jpg?w=768"
              alt="Garantía de dinero de vuelta - Insignia de confianza"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
        <div className="text-sm md:text-right">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold/60">
            {t("footer.hours")}
          </div>
          <div className="text-ivory/85">
            {t("footer.hoursMonFri")} · {t("footer.hoursMonFriValue")}
          </div>
          <div className="text-ivory/85">
            {t("footer.hoursSat")} · {t("footer.hoursSatValue")}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-8 font-mono text-[11px] uppercase tracking-[0.15em] text-gold/40">
        © {new Date().getFullYear()} {SITE.legalName}
      </div>
      <div className="relative h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent">
        <Plane className="absolute top-1/2 -translate-y-1/2 text-gold animate-plane -rotate-90" size={24} />
      </div>
    </footer>
  );
}
