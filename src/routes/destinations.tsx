import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { CtaSection } from "@/components/cta-section";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CARD } from "@/lib/styles";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Destinations,
});

function Destinations() {
  const { t } = useTranslation();

  const destinations = [
    {
      code: "EU",
      name: t("destinations.eu.name"),
      description: t("destinations.eu.description"),
      countries: t("destinations.eu.countries"),
    },
    {
      code: "EC",
      name: t("destinations.ec.name"),
      description: t("destinations.ec.description"),
      countries: t("destinations.ec.countries"),
    },
    {
      code: "BR",
      name: t("destinations.br.name"),
      description: t("destinations.br.description"),
      countries: t("destinations.br.countries"),
    },
    {
      code: "GF",
      name: t("destinations.gf.name"),
      description: t("destinations.gf.description"),
      countries: t("destinations.gf.countries"),
    },
    {
      code: "PA",
      name: t("destinations.pa.name"),
      description: t("destinations.pa.description"),
      countries: t("destinations.pa.countries"),
    },
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("destinationsPage.metaTitle")}</title>
        <meta name="description" content={t("destinationsPage.metaDescription")} />
        <meta property="og:title" content={t("destinationsPage.ogTitle")} />
        <meta property="og:description" content={t("destinationsPage.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("destinationsPage.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 max-w-[20ch] text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("destinationsPage.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("destinationsPage.subtitle")}
          </p>
        </Reveal>
      </section>

      <FlightPath codes="PAP · EU · EC · BR · GF · PA" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, i) => (
            <Reveal key={dest.code} delay={120 + i * 60} className={CARD}>
              <div className="flex items-center justify-between">
                <div className="font-mono text-3xl font-black text-gold/50">{dest.code}</div>
                <div className="font-mono text-xs text-gold/60">{dest.countries}</div>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-gold2">{dest.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/80 text-pretty">
                {dest.description}
              </p>
              <a
                href={whatsappLink(t("contact.whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-gold hover:text-gold2 transition-colors"
              >
                {t("destinationsPage.contactUs")} →
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/15 bg-navy">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <Reveal delay={200}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70">
              {t("destinationsPage.note")}
            </p>
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
