import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import deskStill from "@/assets/desk-still.jpg";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BTN_GOLD, LABEL } from "@/lib/styles";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/randevou")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Randevou,
});

function Randevou() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-deep font-body text-ivory" style={{ colorScheme: "dark" }}>
      <Helmet>
        <title>{t("appointment.metaTitle")}</title>
        <meta name="description" content={t("appointment.metaDescription")} />
        <meta property="og:title" content={t("appointment.ogTitle")} />
        <meta property="og:description" content={t("appointment.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <FlightPath codes="PAP · DEMANDE · SUIVI · ACORD" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="md:col-span-1">
            <Reveal delay={240}>
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10">
                <img
                  src={deskStill}
                  alt="Pasaporte, pase de abordar y pluma dorada sobre un escritorio de cuero"
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-1 flex flex-col gap-6">
            <Reveal delay={240}>
              <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-7">
                <p className={LABEL}>{t("appointment.contactDirect")}</p>
                <p className="mt-4 text-sm text-ivory/85">{SITE.phoneDisplay}</p>
                <p className="text-sm text-ivory/85">{SITE.email}</p>
                <p className="text-sm text-ivory/85">{SITE.address}</p>
                <p className="mt-5 border-t border-gold/15 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {t("footer.hoursMonFri")} · {t("footer.hoursMonFriValue")}  /  {t("footer.hoursSat")} · {t("footer.hoursSatValue")}
                </p>
                <div className="mt-6">
                  <Link to="/pre-consultation" className={BTN_GOLD}>
                    {t("appointment.writeWithoutForm")}
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="aspect-video w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10">
                <video
                  src="https://www.pexels.com/es-es/download/video/29305358/"
                  className="h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
