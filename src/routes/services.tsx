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

  const renderFlag = (flag: string) => {
    if (flag === "world") return <span className="text-2xl">🌍</span>;
    if (flag === "document") return <span className="text-2xl">📄</span>;
    if (flag === "globe") return <span className="text-2xl">🌐</span>;
    return (
      <img
        src={`https://flagcdn.com/w40/${flag}.png`}
        alt={flag}
        className="h-6 w-auto transform hover:scale-125 transition-transform rounded-sm"
      />
    );
  };

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

  const visaCountries = [
    { name: t("servicesPage.guyana"), flag: "gy" },
    { name: t("servicesPage.schengen"), flag: "eu" },
    { name: t("servicesPage.brazil"), flag: "br" },
    { name: t("servicesPage.chile"), flag: "cl" },
    { name: t("servicesPage.ecuador"), flag: "ec" },
    { name: t("servicesPage.mexico"), flag: "mx" },
    { name: t("servicesPage.argentina"), flag: "ar" },
    { name: t("servicesPage.colombia"), flag: "co" },
    { name: t("servicesPage.antilles"), flag: "ai" },
  ];

  const mainServices = [
    {
      id: "visas",
      title: t("servicesPage.visaSection"),
      description: t("servicesPage.visaDescription"),
      icon: "🌍",
    },
    {
      id: "familial",
      title: t("servicesPage.familialSection"),
      description: t("servicesPage.familialDescription"),
      icon: "👨‍👩‍👧‍👦",
    },
    {
      id: "documents",
      title: t("servicesPage.documentsSection"),
      description: t("servicesPage.documentsDescription"),
      icon: "📄",
    },
    {
      id: "asile",
      title: t("servicesPage.asileSection"),
      description: t("servicesPage.asileDescription"),
      icon: "🏠",
    },
    {
      id: "voyage",
      title: t("servicesPage.voyageSection"),
      description: t("servicesPage.voyageDescription"),
      icon: "✈️",
    },
    {
      id: "archives",
      title: t("servicesPage.archivesSection"),
      description: t("servicesPage.archivesDescription"),
      icon: "🗂️",
    },
    {
      id: "casier",
      title: t("servicesPage.casierSection"),
      description: t("servicesPage.casierDescription"),
      icon: "⚖️",
    },
    {
      id: "residence",
      title: t("servicesPage.residenceSection"),
      description: t("servicesPage.residenceDescription"),
      icon: "�",
    },
    {
      id: "travail",
      title: t("servicesPage.travailSection"),
      description: t("servicesPage.travailDescription"),
      icon: "💼",
    },
    {
      id: "etudiant",
      title: t("servicesPage.etudiantSection"),
      description: t("servicesPage.etudiantDescription"),
      icon: "🎓",
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
              <ImageCarousel media={servicesImages} className="h-[504px] w-auto" />
            </div>
          </Reveal>
        </div>
      </section>

      <FlightPath codes="PAP · VISA · ASSISTANCE · ACHEVEMENT" />

      {/* Main Services Section */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mainServices.map((service, i) => (
            <Reveal key={service.id} delay={120 + i * 60} className={CARD}>
              <div className="flex flex-col h-full">
                <div className="text-2xl sm:text-3xl mb-2">{service.icon}</div>
                <h3 className="font-display text-base sm:text-lg font-bold text-gold2">{service.title}</h3>
                <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-ivory/90 text-pretty">
                  {service.description}
                </p>
                <a
                  href="/pre-consultation"
                  className="mt-auto inline-flex items-center justify-center rounded-md bg-gold px-3 py-1.5 text-[11px] sm:text-xs font-medium text-deep transition-colors hover:bg-gold/90"
                >
                  {t("servicesPage.requestConsultation")}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Visa Countries Section */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Reveal delay={60}>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gold2 mb-6 md:mb-8">{t("servicesPage.visaCountriesTitle")}</h2>
        </Reveal>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visaCountries.map((country, i) => (
            <Reveal key={country.name} delay={120 + i * 60} className={CARD}>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <img
                    src={`https://flagcdn.com/w80/${country.flag}.png`}
                    alt={country.name}
                    className="h-10 sm:h-12 w-auto rounded-sm"
                  />
                  <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-gold2">{country.name}</h3>
                </div>
                <a
                  href="/pre-consultation"
                  className="mt-auto inline-flex items-center justify-center rounded-md bg-gold px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-deep transition-colors hover:bg-gold/90"
                >
                  {t("servicesPage.requestConsultation")}
                </a>
              </div>
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
