import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { FlightPath } from "@/components/flight-path";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { Check, X, Calendar, Eye, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useTranslation();
  const { user, role, loading } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [activeTab, setActiveTab] = useState<'consultations' | 'slots'>('consultations');
  const [slots, setSlots] = useState<any[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slot_date: '',
    start_time: '',
    end_time: '',
    max_bookings: 1,
    description: ''
  });

  useEffect(() => {
    if (!loading && (role !== 'admin' && role !== 'staff')) {
      window.location.href = '/';
    }
  }, [loading, role]);

  useEffect(() => {
    if (role === 'admin' || role === 'staff') {
      fetchConsultations();
      fetchSlots();
    }
  }, [role]);

  const fetchConsultations = async () => {
    const { data, error } = await supabase
      .from('pre_consultations')
      .select('*, appointment_slots(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consultations:', error);
    } else {
      setConsultations(data || []);
    }
    setLoadingData(false);
  };

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('appointment_slots')
      .select('*')
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
    } else {
      setSlots(data || []);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding slot:', newSlot);

    if (!newSlot.slot_date || !newSlot.start_time || !newSlot.end_time) {
      console.error('Missing required fields');
      return;
    }

    const { error } = await supabase
      .from('appointment_slots')
      .insert({
        slot_date: newSlot.slot_date,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        max_bookings: newSlot.max_bookings,
        description: newSlot.description || null,
        created_by: user?.id,
      });

    if (error) {
      console.error('Error adding slot:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      alert('Error: ' + error.message);
    } else {
      console.log('Slot added successfully');
      fetchSlots();
      setShowSlotForm(false);
      setNewSlot({
        slot_date: '',
        start_time: '',
        end_time: '',
        max_bookings: 1,
        description: ''
      });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase
      .from('appointment_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slot:', error);
    } else {
      fetchSlots();
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('pre_consultations')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('Error approving consultation:', error);
    } else {
      fetchConsultations();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('pre_consultations')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting consultation:', error);
    } else {
      fetchConsultations();
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleDate) return;

    const { error } = await supabase
      .from('pre_consultations')
      .update({ scheduled_date: rescheduleDate, status: 'rescheduled' })
      .eq('id', id);

    if (error) {
      console.error('Error rescheduling consultation:', error);
    } else {
      fetchConsultations();
      setRescheduleDate('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep font-body text-ivory flex items-center justify-center">
        <p>{t("admin.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("admin.metaTitle")}</title>
        <meta name="description" content={t("admin.metaDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14">
        <Reveal delay={60}>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
            {t("admin.title")}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <h1 className="mt-5 text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("admin.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-6 font-display text-2xl text-muted italic">
            {t("admin.subtitle")}
          </p>
        </Reveal>
      </section>

      <FlightPath codes="DASHBOARD · SUIVI · GESTION" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'consultations'
                ? 'bg-gold text-deep'
                : 'bg-navy2/40 text-ivory/70 hover:text-ivory'
            }`}
          >
            {t("admin.consultationsTab")}
          </button>
          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'slots'
                  ? 'bg-gold text-deep'
                  : 'bg-navy2/40 text-ivory/70 hover:text-ivory'
              }`}
            >
              {t("admin.slotsTab")}
            </button>
          )}
        </div>

        {activeTab === 'slots' && role === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-gold2">{t("admin.manageSlots")}</h2>
              <button
                onClick={() => setShowSlotForm(!showSlotForm)}
                className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t("admin.addSlot")}</span>
              </button>
            </div>

            {showSlotForm && (
              <form onSubmit={handleAddSlot} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.slotDate")}</label>
                    <input
                      type="date"
                      value={newSlot.slot_date}
                      onChange={(e) => setNewSlot({ ...newSlot, slot_date: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.startTime")}</label>
                    <input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.endTime")}</label>
                    <input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.maxBookings")}</label>
                    <input
                      type="number"
                      min="1"
                      value={newSlot.max_bookings}
                      onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.slotDescription")}</label>
                    <input
                      type="text"
                      value={newSlot.description}
                      onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      placeholder={t("admin.slotDescriptionPlaceholder")}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors"
                  >
                    {t("admin.saveSlot")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSlotForm(false)}
                    className="rounded-lg border border-gold/30 px-4 py-2 text-ivory hover:bg-gold/10 transition-colors"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {slots.length === 0 ? (
                <p className="text-center text-ivory/80">{t("admin.noSlots")}</p>
              ) : (
                slots.map((slot) => (
                  <div key={slot.id} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-gold2">
                          {new Date(slot.slot_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="mt-1 text-sm text-ivory/80">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        {slot.description && (
                          <p className="mt-1 text-sm text-ivory/70">{slot.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                          <span>{t("admin.bookings")}: {slot.current_bookings}/{slot.max_bookings}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                            slot.status === 'available' ? 'bg-green-500/10 text-green-400' :
                            slot.status === 'booked' ? 'bg-red-500/10 text-red-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {t(`admin.slotStatus.${slot.status}`)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{t("admin.deleteSlot")}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <>
            {loadingData ? (
              <p className="text-center text-ivory/80">{t("admin.loading")}</p>
            ) : consultations.length === 0 ? (
              <p className="text-center text-ivory/80">{t("admin.noConsultations")}</p>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <Reveal key={consultation.id} delay={100} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-gold2">{consultation.full_name}</h3>
                        <p className="mt-1 text-sm text-ivory/80">{consultation.email}</p>
                        <p className="mt-1 text-sm text-ivory/80">{consultation.whatsapp}</p>
                        {consultation.destination_country && (
                          <p className="mt-2 text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Destino:</span> {consultation.destination_country}
                          </p>
                        )}
                        {consultation.service_type && (
                          <p className="mt-1 text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Servicio:</span> {consultation.service_type}
                          </p>
                        )}
                        {consultation.slot_id && consultation.appointment_slots && (
                          <p className="mt-1 text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Créneau:</span> {new Date(consultation.appointment_slots.slot_date).toLocaleDateString('fr-FR')} {consultation.appointment_slots.start_time}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted">
                          {t("admin.submitted")}: {new Date(consultation.created_at).toLocaleDateString()}
                        </p>
                        {consultation.scheduled_date && (
                          <p className="mt-1 text-xs text-muted">
                            {t("admin.scheduledDate")}: {new Date(consultation.scheduled_date).toLocaleDateString()}
                          </p>
                        )}
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: consultation.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                           consultation.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                           consultation.status === 'rescheduled' ? 'rgba(234, 179, 8, 0.1)' :
                                           'rgba(234, 179, 8, 0.1)',
                            color: consultation.status === 'approved' ? '#22c55e' :
                                   consultation.status === 'rejected' ? '#ef4444' :
                                   consultation.status === 'rescheduled' ? '#eab308' :
                                   '#eab308'
                          }}
                        >
                          {t(`admin.status.${consultation.status}`)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {consultation.payment_proof_url && (
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowProofModal(true);
                            }}
                            className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[13px] text-gold2 hover:bg-gold/10 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>{t("admin.viewProof")}</span>
                          </button>
                        )}
                        {consultation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(consultation.id)}
                              className="flex items-center gap-2 rounded border border-green-500/30 px-3 py-2 text-[13px] text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                              <span>{t("admin.approve")}</span>
                            </button>
                            <button
                              onClick={() => handleReject(consultation.id)}
                              className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span>{t("admin.reject")}</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="rounded border border-gold/30 bg-navy px-2 py-1 text-[13px] text-ivory"
                              />
                              <button
                                onClick={() => handleReschedule(consultation.id)}
                                className="flex items-center gap-2 rounded border border-yellow-500/30 px-3 py-2 text-[13px] text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                              >
                                <Calendar className="h-4 w-4" />
                                <span>{t("admin.reschedule")}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {showProofModal && selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-4xl w-full rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-gold2">{t("admin.paymentProof")}</h3>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-ivory/70 hover:text-ivory"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <img
              src={selectedConsultation.payment_proof_url}
              alt="Payment proof"
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
