import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { CtaSection } from "@/components/cta-section";
import { FlightPath } from "@/components/flight-path";
import { ImageCarousel, MediaItem } from "@/components/image-carousel";
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

  const servicesImages: MediaItem[] = [
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691873-6d6f8f5b60c9?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 1"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691597-681c828fd5d2?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 2"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691549-36a6a3472249?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 3"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691617-79c39a782fa6?q=80&w=410&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 4"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691588-d1fcb0b11752?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 5"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691750-f79284ef999d?q=80&w=410&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 6"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691640-88dd64981308?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 7"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691667-1cf5b0db12b4?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 8"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691640-7d83cd9126e5?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 9"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691615-7995ce92ba02?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 10"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691638-4c9dc7b1c342?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 11"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691563-83994c3dc06a?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 12"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691624-42d8d77e9e8a?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 13"
    },
    {
      type: 'image',
      url: "https://images.unsplash.com/photo-1793114691568-e2343997ee87?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "Travel image 14"
    }
  ];

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

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
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
          </div>
          <Reveal delay={120}>
            <div className="flex justify-center">
              <ImageCarousel media={servicesImages} className="h-126 w-auto" />
            </div>
          </Reveal>
        </div>
      </section>

      <FlightPath codes="PAP · VISA · ASSISTANCE · ACHEVEMENT" />

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
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
