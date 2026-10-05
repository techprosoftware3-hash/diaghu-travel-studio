import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { CtaSection } from "@/components/cta-section";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CARD } from "@/lib/styles";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  const { t } = useTranslation();

  const services = [
    {
      num: "01",
      title: t("services.01.title"),
      description: t("services.01.description"),
      details: t("services.01.details"),
      flags: ["🇫🇷", "🇪🇸", "🇺🇸", "🇨🇦", "🇧🇷", "🇪🇨", "🇵🇦"],
    },
    {
      num: "02",
      title: t("services.02.title"),
      description: t("services.02.description"),
      details: t("services.02.details"),
      flags: ["🇫🇷", "🇪🇸", "🇺🇸", "🇨🇦"],
    },
    {
      num: "03",
      title: t("services.03.title"),
      description: t("services.03.description"),
      details: t("services.03.details"),
      flags: ["🌍"],
    },
    {
      num: "04",
      title: t("services.04.title"),
      description: t("services.04.description"),
      details: t("services.04.details"),
      flags: ["📄"],
    },
    {
      num: "05",
      title: t("services.05.title"),
      description: t("services.05.description"),
      details: t("services.05.details"),
      flags: ["🇨🇦"],
    },
    {
      num: "06",
      title: t("services.06.title"),
      description: t("services.06.description"),
      details: t("services.06.details"),
      flags: ["🇺🇸"],
    },
    {
      num: "07",
      title: t("services.07.title"),
      description: t("services.07.description"),
      details: t("services.07.details"),
      flags: ["🇫🇷", "🇪🇸", "🇺🇸", "🇨🇦"],
    },
    {
      num: "08",
      title: t("services.08.title"),
      description: t("services.08.description"),
      details: t("services.08.details"),
      flags: ["🌐"],
    },
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("servicesPage.metaTitle")}</title>
        <meta name="description" content={t("servicesPage.metaDescription")} />
        <meta property="og:title" content={t("servicesPage.ogTitle")} />
        <meta property="og:description" content={t("servicesPage.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("servicesPage.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 max-w-[20ch] text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("servicesPage.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("servicesPage.subtitle")}
          </p>
        </Reveal>
      </section>

      <FlightPath codes="PAP · VISA · ASSISTANCE · ACHEVEMENT" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.num} delay={120 + i * 60} className={CARD}>
              <div className="font-display text-4xl font-black text-gold/50">{service.num}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-gold2">{service.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1 text-2xl">
                {service.flags.map((flag, idx) => (
                  <span key={idx} className="transform hover:scale-125 transition-transform">
                    {flag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ivory/90 text-pretty">
                {service.description}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ivory/70 text-pretty">
                {service.details}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/15 bg-navy">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <Reveal delay={200}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70">
              {t("servicesPage.disclaimer")}
            </p>
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
