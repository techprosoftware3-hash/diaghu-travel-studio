import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BTN_GOLD, FIELD, LABEL } from "@/lib/styles";
import { SITE, whatsappLink } from "@/lib/site";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  destination: string;
  service: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  destination: "",
  service: "",
};

export const Route = createFileRoute("/pre-consultation")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreConsultation,
});

function PreConsultation() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSent(false);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError(t("preConsultation.errorRequired"));
      return;
    }
    setError("");
    const message = [
      t("preConsultation.whatsappIntro"),
      `${t("preConsultation.fieldName")} : ${form.name.trim()}`,
      `${t("preConsultation.fieldEmail")} : ${form.email.trim()}`,
      `${t("preConsultation.fieldWhatsapp")} : ${form.whatsapp.trim()}`,
      `${t("preConsultation.fieldDestination")} : ${form.destination.trim() || "—"}`,
      `${t("preConsultation.fieldService")} : ${form.service.trim() || "—"}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const services = [
    t("preConsultation.serviceTourist"),
    t("preConsultation.serviceSchengen"),
    t("preConsultation.serviceFamily"),
    t("preConsultation.serviceProfile"),
    t("preConsultation.serviceOther"),
  ];

  return (
    <div className="min-h-screen bg-deep font-body text-ivory" style={{ colorScheme: "dark" }}>
      <Helmet>
        <title>{t("preConsultation.metaTitle")}</title>
        <meta name="description" content={t("preConsultation.metaDescription")} />
        <meta property="og:title" content={t("preConsultation.ogTitle")} />
        <meta property="og:description" content={t("preConsultation.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("preConsultation.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 max-w-[22ch] text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("preConsultation.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("preConsultation.subtitle")}
          </p>
        </Reveal>
      </section>

      <FlightPath codes="PAP · DEMANDE · ANALYSE · RÉPONSE" />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal delay={140}>
          <form
            onSubmit={onSubmit}
            className="rounded-[18px] border border-gold/25 bg-navy2/40 p-8 md:p-10"
          >
            <div className="grid gap-6">
              <div>
                <label className={LABEL} htmlFor="name">
                  {t("preConsultation.labelName")} *
                </label>
                <input
                  id="name"
                  className={`${FIELD} mt-2`}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("preConsultation.placeholderName")}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="email">
                  {t("preConsultation.labelEmail")} *
                </label>
                <input
                  id="email"
                  type="email"
                  className={`${FIELD} mt-2`}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("preConsultation.placeholderEmail")}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="whatsapp">
                  {t("preConsultation.labelWhatsapp")} *
                </label>
                <input
                  id="whatsapp"
                  className={`${FIELD} mt-2`}
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder={t("preConsultation.placeholderWhatsapp")}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="destination">
                  {t("preConsultation.labelDestination")}
                </label>
                <input
                  id="destination"
                  className={`${FIELD} mt-2`}
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  placeholder={t("preConsultation.placeholderDestination")}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="service">
                  {t("preConsultation.labelService")}
                </label>
                <select
                  id="service"
                  className={`${FIELD} mt-2`}
                  value={form.service}
                  onChange={(e) => update("service", e.target.value)}
                >
                  <option value="">{t("preConsultation.selectService")}</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="mt-6 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-ivory">
                {error}
              </p>
            )}

            <div className="mt-8">
              <button type="submit" className={BTN_GOLD}>
                {t("preConsultation.submit")}
              </button>
            </div>

            {sent && !error && (
              <p className="mt-6 text-sm leading-relaxed text-gold2">
                {t("preConsultation.success")} {SITE.phoneDisplay}.
              </p>
            )}
          </form>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
