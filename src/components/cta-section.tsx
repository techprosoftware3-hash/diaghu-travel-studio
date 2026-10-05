import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { BTN_GHOST, BTN_GOLD } from "@/lib/styles";
import { whatsappLink } from "@/lib/site";
import { Reveal } from "./reveal";

export function CtaSection() {
  const { t } = useTranslation();
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 text-center">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <div
            className="stamp mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/60 font-display text-lg font-black tracking-widest text-gold2"
            style={{ animationDelay: "200ms" }}
          >
            DGH
          </div>
          <Reveal delay={120}>
            <h2 className="mt-8 text-balance font-display text-4xl font-black tracking-tight text-gold2 md:text-5xl">
              {t("cta.heading")}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-3 font-display text-lg italic text-muted">{t("cta.subtitle")}</p>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/pre-consultation" className={BTN_GOLD}>
                {t("site.takeAppointment")}
              </Link>
              <a
                href={whatsappLink(t("contact.whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BTN_GHOST, "glow")}
                style={{ animationDelay: "1.2s" }}
              >
                {t("site.whatsapp")}
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <div className="flex justify-center">
            <img
              src="https://static.depositphotos.com//storage/ai_tools/preview/1024/file_cdf1a9ba-26a1-4761-8371-b3380ffea84a_6ac3fcb47fca70.66014533.png"
              alt="Banderas de países - Asesoría migratoria DIAGHU"
              className="h-64 w-auto object-contain mix-blend-normal rounded-none pulse-zoom"
              style={{ background: '#071120' }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
