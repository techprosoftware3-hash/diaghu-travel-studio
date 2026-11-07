import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CtaSection } from "@/components/cta-section";
import { ImageCarousel } from "@/components/image-carousel";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TestimonialsSection } from "@/components/testimonials-section";
import { BTN_GHOST, BTN_GOLD, CARD } from "@/lib/styles";
import { whatsappLink } from "@/lib/site";
import emblem from "@/assets/emblem.png";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useTranslation();
  // La ancla se lee de la URL en el navegador: los componentes de ruta se
  // dividen en módulos aparte y ahí un hook del router puede quedarse sin
  // contexto y romper la página entera ("useContext of null").
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
  ];

  const stats = [
    { value: "6", suffix: "+", label: t("stats.experience") },
    { value: " 800", suffix: "", label: t("stats.files") },
    { value: "98", suffix: "%", label: t("stats.success") },
    { value: "32", suffix: "", label: t("stats.countries") },
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <SiteHeader />

      <section className="relative mx-auto max-w-6xl px-6 pt-2 pb-4 md:pt-4 md:pb-6">
        {/* Logo de fondo */}
        <div
          className="absolute inset-0 -z-10 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${emblem})`,
            backgroundSize: '50%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal delay={60}>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
                {t("site.kicker")}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <h1 className="mt-5 text-balance font-display text-6xl leading-[0.9] font-black tracking-tight text-gold2 md:text-[5.5rem]">
                DIAGHU
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-6 flex items-center gap-3 sm:gap-4 overflow-hidden">
                <p className="text-balance font-display text-xl sm:text-2xl text-ivory italic md:text-3xl">
                  {t("site.tagline1")}
                </p>
                <img
                  src="https://www.pngarts.com/files/1/Globe-PNG-Background-Image.png"
                  alt="Travel icon"
                  className="h-10 sm:h-12 md:h-14 rotate-slow"
                />
              </div>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-3 font-display text-base sm:text-lg text-muted italic">{t("site.tagline2")}</p>
            </Reveal>
            <Reveal delay={380}>
              <p className="mt-6 max-w-[46ch] text-[13px] sm:text-[15px] leading-relaxed text-ivory/85 text-pretty">
                {t("site.heroDescription")}
              </p>
            </Reveal>
            <Reveal delay={460}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/pre-consultation" className={BTN_GOLD}>
                  {t("site.takeAppointment")}
                </a>
                <a
                  href={whatsappLink(t("contact.whatsappMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_GHOST}
                >
                  {t("site.whatsapp")}
                </a>
              </div>
            </Reveal>
            <Reveal delay={520}>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-gold2 glow">
                <ShieldCheck className="h-5 w-5" />
                <span>✓ {t("site.trustBadge")}</span>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={260}>
              <ImageCarousel />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {mainServices.map((service, i) => (
            <Reveal key={service.id} delay={120 + i * 60} className={CARD}>
              <div className="flex flex-col h-full">
                <div className="text-2xl sm:text-3xl mb-2">{service.icon}</div>
                <h3 className="font-display text-base sm:text-lg font-bold text-gold2">{service.title}</h3>
                <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-ivory/90 text-pretty">
                  {service.description}
                </p>
                <div className="mt-auto flex flex-col gap-2">
                  {service.id !== "documents" && (
                    <a
                      href="/pre-consultation"
                      className="inline-flex items-center justify-center rounded-md bg-gold px-3 py-1.5 text-[11px] sm:text-xs font-medium text-deep transition-colors hover:bg-gold/90"
                    >
                      {t("servicesPage.requestConsultation")}
                    </a>
                  )}
                  {service.id === "documents" && (
                    <a
                      href={whatsappLink(t("contact.whatsappMessage"))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-white transition-colors hover:bg-green-700"
                    >
                      {t("servicesPage.requestService")}
                    </a>
                  )}
                </div>
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
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center sm:gap-6 sm:px-6 md:gap-8 md:py-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={100 + i * 60}>
              <div className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-gold2">
                {stat.value}
                {stat.suffix && <span className="text-gold">{stat.suffix}</span>}
              </div>
              <div className="mt-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <TestimonialsSection />
      <CtaSection />
      <SiteFooter />
    </div>
  );
}
