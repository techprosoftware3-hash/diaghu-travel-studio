import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { BTN_GOLD, FIELD, LABEL } from "@/lib/styles";
import { SITE, whatsappLink } from "@/lib/site";

const PAYPAL_EMAIL = import.meta.env.VITE_PAYPAL_EMAIL || 'your-paypal-business-email@example.com';

type AppointmentSlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  description: string | null;
};

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  destination: string;
  service: string;
  paymentProof: File | null;
  slotId: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  destination: "",
  service: "",
  paymentProof: null,
  slotId: "",
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
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const { data, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('status', 'available')
        .gte('slot_date', new Date().toISOString().split('T')[0])
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching slots:', error);
      } else {
        // Filter slots that still have availability
        const available = (data || []).filter(
          slot => slot.current_bookings < slot.max_bookings
        );
        setAvailableSlots(available);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const update = (key: keyof FormState, value: string | File | null) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSent(false);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError(t("preConsultation.errorRequired"));
      return;
    }

    if (form.slotId && !form.paymentProof) {
      setError(t("preConsultation.paymentProofRequired"));
      return;
    }

    // Check slot availability before proceeding
    if (form.slotId) {
      console.log('Checking slot availability for:', form.slotId);
      const { data: isAvailable, error: checkError } = await supabase.rpc('check_slot_availability', {
        p_slot_id: form.slotId
      });

      console.log('Slot availability check result:', isAvailable, 'Error:', checkError);

      if (checkError) {
        console.error('Error checking slot availability:', checkError);
        setError("Error al verificar disponibilidad del turno.");
        return;
      }

      if (!isAvailable) {
        setError("Este turno ya no está disponible. Por favor selecciona otro turno.");
        fetchAvailableSlots(); // Refresh to show updated availability
        return;
      }
    }

    setError("");
    setSent(false);

    try {
      // Upload payment proof to Supabase Storage
      const fileExt = form.paymentProof.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, form.paymentProof);

      if (uploadError) {
        setError(t("preConsultation.uploadError"));
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Save pre-consultation to database
      const { error: dbError } = await supabase.from('pre_consultations').insert({
        user_id: user.id,
        full_name: form.name.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        destination_country: form.destination.trim() || null,
        service_type: form.service.trim() || null,
        message: null,
        status: 'pending',
        payment_proof_url: publicUrl,
        scheduled_date: null,
        slot_id: form.slotId || null,
      });

      if (dbError) {
        console.error('Error saving consultation:', dbError);
        setError(t("preConsultation.submitError"));
        return;
      }

      // If a slot was selected, book it atomically
      if (form.slotId) {
        console.log('Attempting to book slot:', form.slotId);
        const { data: booked, error: bookingError } = await supabase.rpc('book_slot', {
          p_slot_id: form.slotId
        });

        console.log('Booking result:', booked, 'Error:', bookingError);

        if (bookingError) {
          console.error('Error booking slot:', bookingError);
          setError("Error al reservar el turno: " + bookingError.message);
          // Try to rollback the consultation
          await supabase.from('pre_consultations').delete().eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
          return;
        }

        if (!booked) {
          console.error('Slot booking returned false');
          setError("No se pudo reservar el turno. El turno ya está completo o fue reservado por otra persona.");
          // Try to rollback the consultation
          await supabase.from('pre_consultations').delete().eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
          return;
        }
      }

      setSent(true);
      setForm(EMPTY);
      fetchAvailableSlots();
    } catch (err) {
      console.error('Error submitting consultation:', err);
      setError(t("preConsultation.submitError"));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      update('paymentProof', file);
    }
  };

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("preConsultation.metaTitle")}</title>
        <meta name="description" content={t("preConsultation.metaDescription")} />
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

      <FlightPath codes="CONSULTATION · PAIEMENT · SUIVI" />

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
                      {t("preConsultation.labelName")}
                    </label>
                    <input
                      id="name"
                      className={`${FIELD} mt-2`}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={t("preConsultation.placeholderName")}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="email">
                      {t("preConsultation.labelEmail")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`${FIELD} mt-2`}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder={t("preConsultation.placeholderEmail")}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="whatsapp">
                      {t("preConsultation.labelWhatsapp")}
                    </label>
                    <input
                      id="whatsapp"
                      className={`${FIELD} mt-2`}
                      value={form.whatsapp}
                      onChange={(e) => update("whatsapp", e.target.value)}
                      placeholder={t("preConsultation.placeholderWhatsapp")}
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
                  <div className="sm:col-span-2">
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
                      <option value="tourist_visa">{t("preConsultation.serviceTourist")}</option>
                      <option value="schengen_visa">{t("preConsultation.serviceSchengen")}</option>
                      <option value="family_reunion">{t("preConsultation.serviceFamily")}</option>
                      <option value="profile_analysis">{t("preConsultation.serviceProfile")}</option>
                      <option value="other">{t("preConsultation.serviceOther")}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="slotId">
                      {t("preConsultation.labelSlot")}
                    </label>
                    <select
                      id="slotId"
                      className={`${FIELD} mt-2`}
                      value={form.slotId}
                      onChange={(e) => update("slotId", e.target.value)}
                      disabled={loadingSlots}
                    >
                      <option value="">{t("preConsultation.selectSlot")}</option>
                      {availableSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} - {slot.start_time} à {slot.end_time}
                          {slot.description && ` (${slot.description})`}
                        </option>
                      ))}
                    </select>
                    {form.slotId && (
                      <p className="mt-2 text-xs text-gold2">
                        {t("preConsultation.slotPaymentRequired")}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL} htmlFor="paymentProof">
                      {t("preConsultation.labelPaymentProof")}
                    </label>
                    <input
                      id="paymentProof"
                      type="file"
                      accept="image/*,.pdf"
                      className={`${FIELD} mt-2`}
                      onChange={handleFileChange}
                    />
                    <p className="mt-1 text-xs text-muted">{t("preConsultation.paymentProofHint")}</p>
                  </div>
                </div>

                {error && (
                  <p className="mt-6 rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-ivory">
                    {error}
                  </p>
                )}

                {sent && !error && (
                  <p className="mt-6 text-sm leading-relaxed text-gold2">
                    {t("preConsultation.success")} {SITE.phoneDisplay}.
                  </p>
                )}

                <div className="mt-8">
                  <button type="submit" className={BTN_GOLD}>
                    {t("preConsultation.submit")}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={240}>
              <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-7">
                <h3 className="font-display text-xl font-bold text-gold2 mb-4">{t("auth.paypalTitle")}</h3>
                <p className="text-sm text-ivory/85 mb-4">{t("auth.paypalDescription")}</p>
                <form action={`https://www.paypal.com/cgi-bin/webscr`} method="post" target="_blank">
                  <input type="hidden" name="cmd" value="_xclick" />
                  <input type="hidden" name="business" value={PAYPAL_EMAIL} />
                  <input type="hidden" name="item_name" value="Pre-consultation DIAGHU" />
                  <input type="hidden" name="amount" value="50.00" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <button type="submit" className={BTN_GOLD}>
                    <img
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"
                      alt="PayPal"
                      className="h-6 w-auto mr-2"
                    />
                    {t("auth.paypalButton")}
                  </button>
                </form>
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />

      <SiteFooter />
    </div>
  );
}
