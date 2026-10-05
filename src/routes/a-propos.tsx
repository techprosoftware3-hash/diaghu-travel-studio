import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import portrait from "@/assets/advisor-portrait.jpg";
import { CtaSection } from "@/components/cta-section";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CARD } from "@/lib/styles";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: APropos,
});

function APropos() {
  const { t } = useTranslation();

  const values = [
    {
      num: "01",
      title: t("about.values.01.title"),
      body: t("about.values.01.body"),
    },
    {
      num: "02",
      title: t("about.values.02.title"),
      body: t("about.values.02.body"),
    },
    {
      num: "03",
      title: t("about.values.03.title"),
      body: t("about.values.03.body"),
    },
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("about.metaTitle")}</title>
        <meta name="description" content={t("about.metaDescription")} />
        <meta property="og:title" content={t("about.ogTitle")} />
        <meta property="og:description" content={t("about.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-12 md:pt-16 md:pb-20">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("about.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 max-w-[20ch] text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("about.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-ivory italic">
            {t("about.subtitle")}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal delay={200}>
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-navy2 outline-1 -outline-offset-1 outline-gold/10">
                <img
                  src={portrait}
                  alt="Conseiller migratoire de DIAGHU revisant un dossier de visa à son bureau"
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={120}>
              <p className="text-[15px] leading-relaxed text-ivory/85 text-pretty">
                {t("about.description1")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 text-[15px] leading-relaxed text-ivory/85 text-pretty">
                {t("about.description2")}
              </p>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-5 font-display text-lg text-muted italic text-pretty">
                {t("about.description3")}
              </p>
            </Reveal>
            <Reveal delay={360}>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-gold/70">
                {t("about.languages")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <FlightPath codes="PAP · MIA · MAD · YUL" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.num} delay={120 + i * 60} className={CARD}>
              <div className="font-display text-4xl font-black text-gold/50">{value.num}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-gold2">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/80 text-pretty">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
