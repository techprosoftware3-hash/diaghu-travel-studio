import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CtaSection } from "@/components/cta-section";
import { FlightPath } from "@/components/flight-path";
import { ImageCarousel } from "@/components/image-carousel";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BTN_GHOST, BTN_GOLD, CARD } from "@/lib/styles";
import { whatsappLink } from "@/lib/site";
import emblem from "@/assets/emblem.png";

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

  const services = [
    {
      num: "01",
      title: t("services.01.title"),
      body: t("services.01.body"),
    },
    {
      num: "02",
      title: t("services.02.title"),
      body: t("services.02.body"),
    },
    {
      num: "03",
      title: t("services.03.title"),
      body: t("services.03.body"),
    },
    {
      num: "04",
      title: t("services.04.title"),
      body: t("services.04.body"),
    },
    {
      num: "05",
      title: t("services.05.title"),
      body: t("services.05.body"),
    },
    {
      num: "06",
      title: t("services.06.title"),
      body: t("services.06.body"),
    },
    {
      num: "07",
      title: t("services.07.title"),
      body: t("services.07.body"),
    },
    {
      num: "08",
      title: t("services.08.title"),
      body: t("services.08.body"),
    },
  ];

  const stats = [
    { value: "12", suffix: "+", label: t("stats.experience") },
    { value: "1 400", suffix: "", label: t("stats.files") },
    { value: "98", suffix: "%", label: t("stats.success") },
    { value: "32", suffix: "", label: t("stats.countries") },
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <SiteHeader />

      <section className="relative mx-auto max-w-6xl px-6 pt-10 pb-16">
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
              <p className="mt-6 text-balance font-display text-2xl text-ivory italic md:text-3xl">
                {t("site.tagline1")}
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-3 font-display text-lg text-muted italic">{t("site.tagline2")}</p>
            </Reveal>
            <Reveal delay={380}>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ivory/85 text-pretty">
                {t("site.heroDescription")}
              </p>
            </Reveal>
            <Reveal delay={460}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/randevou" className={BTN_GOLD}>
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
          </div>

          <div className="md:col-span-5">
            <Reveal delay={260}>
              <ImageCarousel />
            </Reveal>
          </div>
        </div>
      </section>

      <FlightPath />

      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="grid gap-5 md:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service.num} delay={120 + i * 60} className={CARD}>
              <div className="font-display text-4xl font-black text-gold/50">{service.num}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-gold2">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/80 text-pretty">
                {service.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/15 bg-navy">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 text-center md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={100 + i * 60}>
              <div className="font-display text-5xl font-black text-gold2">
                {stat.value}
                {stat.suffix && <span className="text-gold">{stat.suffix}</span>}
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection />
      <SiteFooter />
    </div>
  );
}
