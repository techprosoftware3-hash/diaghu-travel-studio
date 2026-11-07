import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { Check, X, Calendar, Clock, AlertCircle } from "lucide-react";

type Consultation = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  destination_country: string | null;
  service_type: string | null;
  status: string;
  created_at: string;
  scheduled_date: string | null;
  appointment_slots: {
    slot_date: string;
    start_time: string;
    end_time: string;
  } | null;
};

export const Route = createFileRoute("/my-consultations")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyConsultations,
});

function MyConsultations() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      fetchConsultations();
    }
  }, [user]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pre_consultations')
        .select('*, appointment_slots(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consultations:', error);
      } else {
        setConsultations(data || []);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-400" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-400" />;
      case 'rescheduled':
        return <Calendar className="h-5 w-5 text-yellow-400" />;
      default:
        return <Clock className="h-5 w-5 text-gold2" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'rescheduled':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gold/10 text-gold2 border-gold/30';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep font-body text-ivory flex items-center justify-center">
        <p>{t("admin.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("myConsultations.metaTitle")}</title>
        <meta name="description" content={t("myConsultations.metaDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("myConsultations.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("myConsultations.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("myConsultations.subtitle")}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {consultations.length === 0 ? (
          <Reveal delay={140}>
            <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gold/50 mx-auto mb-4" />
              <p className="text-xl text-muted">{t("myConsultations.noConsultations")}</p>
              <a
                href="/pre-consultation"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-deep font-medium hover:bg-gold/90 transition-colors"
              >
                {t("myConsultations.bookFirst")}
              </a>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation, index) => (
              <Reveal key={consultation.id} delay={140 + index * 60} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {getStatusIcon(consultation.status)}
                      <h3 className="font-display text-xl font-bold text-gold2">
                        {t(`myConsultations.status.${consultation.status}`)}
                      </h3>
                    </div>
                    {consultation.status === 'approved' && (
                      <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-400 mb-1">
                              {t("myConsultations.congratulationsTitle")}
                            </p>
                            <p className="text-sm text-ivory/90 leading-relaxed">
                              {t("myConsultations.congratulationsMessage")}
                            </p>
                            {consultation.appointment_slots && (
                              <p className="mt-2 text-sm text-ivory/80">
                                <span className="font-medium text-green-400">
                                  {t("myConsultations.advisorWillContact")}:
                                </span>{' '}
                                {new Date(consultation.appointment_slots.slot_date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}{' '}
                                {consultation.appointment_slots.start_time} - {consultation.appointment_slots.end_time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <p className="text-ivory/80">
                        <span className="font-mono text-gold/60">{t("myConsultations.submitted")}:</span>{' '}
                        {new Date(consultation.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {consultation.destination_country && (
                        <p className="text-ivory/80">
                          <span className="font-mono text-gold/60">{t("myConsultations.destination")}:</span>{' '}
                          {consultation.destination_country}
                        </p>
                      )}
                      {consultation.service_type && (
                        <p className="text-ivory/80">
                          <span className="font-mono text-gold/60">{t("myConsultations.service")}:</span>{' '}
                          {t(`preConsultation.service${consultation.service_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
                        </p>
                      )}
                      {consultation.scheduled_date && (
                        <p className="text-ivory/80">
                          <span className="font-mono text-gold/60">{t("myConsultations.scheduledDate")}:</span>{' '}
                          {new Date(consultation.scheduled_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      {consultation.appointment_slots && (
                        <p className="text-ivory/80">
                          <span className="font-mono text-gold/60">{t("myConsultations.slot")}:</span>{' '}
                          {new Date(consultation.appointment_slots.slot_date).toLocaleDateString('fr-FR')}{' '}
                          {consultation.appointment_slots.start_time} - {consultation.appointment_slots.end_time}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium border ${getStatusColor(consultation.status)}`}>
                    {t(`myConsultations.status.${consultation.status}`)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
