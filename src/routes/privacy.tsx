import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("privacy.metaTitle")}</title>
        <meta name="description" content={t("privacy.metaDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-14">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("privacy.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("privacy.heading")}
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Reveal delay={220}>
          <div className="prose prose-invert max-w-none">
            <p className="text-ivory/90 leading-relaxed mb-6">
              {t("privacy.intro")}
            </p>
            
            <h2 className="font-display text-2xl font-bold text-gold2 mt-8 mb-4">
              {t("privacy.cookiesSection")}
            </h2>
            <p className="text-ivory/90 leading-relaxed mb-4">
              {t("privacy.cookiesDescription")}
            </p>
            <ul className="list-disc list-inside text-ivory/80 space-y-2 mb-6">
              <li>{t("privacy.cookiesEssential")}</li>
              <li>{t("privacy.cookiesAnalytics")}</li>
              <li>{t("cookiesCookiesPreferences")}</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-gold2 mt-8 mb-4">
              {t("privacy.dataSection")}
            </h2>
            <p className="text-ivory/90 leading-relaxed mb-6">
              {t("privacy.dataDescription")}
            </p>

            <h2 className="font-display text-2xl font-bold text-gold2 mt-8 mb-4">
              {t("privacy.contactSection")}
            </h2>
            <p className="text-ivory/90 leading-relaxed">
              {t("privacy.contactDescription")}
            </p>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
