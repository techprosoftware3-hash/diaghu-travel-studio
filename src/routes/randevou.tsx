import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import deskStill from "@/assets/desk-still.jpg";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BTN_GHOST, BTN_GOLD, FIELD, LABEL } from "@/lib/styles";
import { SITE, whatsappLink } from "@/lib/site";

type FormState = {
  name: string;
  contact: string;
  country: string;
  service: string;
  date: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  contact: "",
  country: "",
  service: "",
  date: "",
  message: "",
};

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
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!form.service) {
      setForm((f) => ({ ...f, service: t("services.01.title") }));
    }
  }, [t, form.service]);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSent(false);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      setError(t("appointment.errorRequired"));
      return;
    }
    setError("");
    const message = [
      t("appointment.whatsappIntro"),
      `${t("appointment.fieldName")} : ${form.name.trim()}`,
      `${t("appointment.fieldContact")} : ${form.contact.trim()}`,
      `${t("appointment.fieldCountry")} : ${form.country.trim() || "—"}`,
      `${t("appointment.fieldService")} : ${form.service}`,
      `${t("appointment.fieldDate")} : ${form.date || t("appointment.toBeArranged")}`,
      form.message.trim() ? `${t("appointment.fieldMessage")} : ${form.message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-deep font-body text-ivory" style={{ colorScheme: "dark" }}>
      <Helmet>
        <title>{t("appointment.metaTitle")}</title>
        <meta name="description" content={t("appointment.metaDescription")} />
        <meta property="og:title" content={t("appointment.ogTitle")} />
        <meta property="og:description" content={t("appointment.ogDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("appointment.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 max-w-[22ch] text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("appointment.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("appointment.subtitle")}
          </p>
        </Reveal>
      </section>

      <FlightPath codes="PAP · DEMANDE · SUIVI · ACORD" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal delay={140}>
              <form
                onSubmit={onSubmit}
                className="rounded-[18px] border border-gold/25 bg-navy2/40 p-8 md:p-10"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="name">
                      {t("appointment.labelName")}
                    </label>
                    <input
                      id="name"
                      className={`${FIELD} mt-2`}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={t("appointment.placeholderName")}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="contact">
                      {t("appointment.labelContact")}
                    </label>
                    <input
                      id="contact"
                      className={`${FIELD} mt-2`}
                      value={form.contact}
                      onChange={(e) => update("contact", e.target.value)}
                      placeholder={t("appointment.placeholderContact")}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="country">
                      {t("appointment.labelCountry")}
                    </label>
                    <input
                      id="country"
                      className={`${FIELD} mt-2`}
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      placeholder={t("appointment.placeholderCountry")}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="service">
                      {t("appointment.labelService")}
                    </label>
                    <select
                      id="service"
                      className={`${FIELD} mt-2`}
                      value={form.service}
                      onChange={(e) => update("service", e.target.value)}
                    >
                      <option value={t("services.01.title")}>{t("services.01.title")}</option>
                      <option value={t("services.02.title")}>{t("services.02.title")}</option>
                      <option value={t("services.03.title")}>{t("services.03.title")}</option>
                      <option value={t("preConsultation.serviceOtherShort")}>{t("preConsultation.serviceOtherShort")}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="date">
                      {t("appointment.labelDate")}
                    </label>
                    <input
                      id="date"
                      type="date"
                      className={`${FIELD} mt-2`}
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="message">
                      {t("appointment.labelMessage")}
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className={`${FIELD} mt-2 resize-none`}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder={t("appointment.placeholderMessage")}
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-6 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-ivory">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button type="submit" className={BTN_GOLD}>
                    {t("appointment.sendWhatsapp")}
                  </button>
                  <a href={whatsappLink(t("contact.whatsappMessage"))} target="_blank" rel="noopener noreferrer" className={BTN_GHOST}>
                    {t("appointment.writeWithoutForm")}
                  </a>
                </div>

                {sent && !error && (
                  <p className="mt-6 text-sm leading-relaxed text-gold2">
                    {t("appointment.successMessage")} {SITE.phoneDisplay}.
                  </p>
                )}
              </form>
            </Reveal>
          </div>

          <div className="md:col-span-5">
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
              <div className="mt-6 rounded-[18px] border border-gold/25 bg-navy2/40 p-7">
                <p className={LABEL}>{t("appointment.contactDirect")}</p>
                <p className="mt-4 text-sm text-ivory/85">{SITE.phoneDisplay}</p>
                <p className="text-sm text-ivory/85">{SITE.email}</p>
                <p className="text-sm text-ivory/85">{SITE.address}</p>
                <p className="mt-5 border-t border-gold/15 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {t("footer.hoursMonFri")} · {t("footer.hoursMonFriValue")}  /  {t("footer.hoursSat")} · {t("footer.hoursSatValue")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
