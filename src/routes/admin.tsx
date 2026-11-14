import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { Check, X, Calendar, Eye, Plus, Trash2, MessageCircle, ZoomIn, ZoomOut, RotateCcw, Download, Phone, AlertTriangle, BarChart3 } from "lucide-react";

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
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [activeTab, setActiveTab] = useState<'consultations' | 'slots' | 'testimonials'>('consultations');
  const [slots, setSlots] = useState<any[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slot_date: '',
    start_time: '',
    end_time: '',
    max_bookings: 1,
    description: '',
    recurrence: 'none', // none, weekly, monthly
    selectedDays: [] as number[], // 0-6 for Sunday-Saturday
    monthlyDay: 1, // 1-31
    recurrenceEndDate: ''
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    client_name: '',
    content: '',
    language: 'ht'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (role !== 'admin' && role !== 'staff')) {
      window.location.href = '/';
    }
  }, [loading, role]);

  useEffect(() => {
    if (role === 'admin' || role === 'staff') {
      fetchConsultations();
      fetchSlots();
      fetchTestimonials();
      fetchSiteVisits();
    }
  }, [role]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-deep font-body text-ivory flex items-center justify-center">
        <p>{t("admin.loading")}</p>
      </div>
    );
  }

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

  const pendingCount = consultations.filter(c => c.status === 'pending').length;

  // Calculate statistics
  const totalVisits = siteVisits.length;
  const visitCountryStats = siteVisits.reduce((acc, visit) => {
    const country = visit.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueSessions = new Set(siteVisits.map(v => v.session_id)).size;

  const filteredConsultations = consultations.filter(consultation => {
    // Filter by status
    if (filterStatus !== 'all' && consultation.status !== filterStatus) {
      return false;
    }

    // Filter by search (name, email, or whatsapp)
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      const matchesName = consultation.full_name?.toLowerCase().includes(searchLower);
      const matchesEmail = consultation.email?.toLowerCase().includes(searchLower);
      const matchesWhatsapp = consultation.whatsapp?.toLowerCase().includes(searchLower);
      const matchesDestination = consultation.destination_country?.toLowerCase().includes(searchLower);
      const matchesService = consultation.service_type?.toLowerCase().includes(searchLower);

      if (!matchesName && !matchesEmail && !matchesWhatsapp && !matchesDestination && !matchesService) {
        return false;
      }
    }

    // Filter by date
    if (filterDate) {
      const consultationDate = new Date(consultation.created_at).toISOString().split('T')[0];
      if (consultationDate !== filterDate) {
        return false;
      }
    }

    return true;
  });

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

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
    } else {
      setTestimonials(data || []);
    }
  };

  const fetchSiteVisits = async () => {
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching site visits:', error);
    } else {
      setSiteVisits(data || []);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding slot:', newSlot);

    if (!newSlot.slot_date || !newSlot.start_time || !newSlot.end_time) {
      console.error('Missing required fields');
      return;
    }

    const slotsToInsert: any[] = [];

    if (newSlot.recurrence === 'none') {
      // Single slot
      slotsToInsert.push({
        slot_date: newSlot.slot_date,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        max_bookings: newSlot.max_bookings,
        description: newSlot.description || null,
        created_by: user?.id,
      });
    } else if (newSlot.recurrence === 'weekly') {
      // Weekly recurrence - generate slots for selected days for 4 weeks
      const startDate = new Date(newSlot.slot_date);
      const defaultEndDate = new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000);
      const endDate = newSlot.recurrenceEndDate ? new Date(newSlot.recurrenceEndDate) : defaultEndDate;

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (newSlot.selectedDays.includes(dayOfWeek)) {
          slotsToInsert.push({
            slot_date: currentDate.toISOString().split('T')[0],
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            max_bookings: newSlot.max_bookings,
            description: newSlot.description || null,
            created_by: user?.id,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (newSlot.recurrence === 'monthly') {
      // Monthly recurrence - generate slots for specific day for 3 months
      const startDate = new Date(newSlot.slot_date);
      const targetDay = newSlot.monthlyDay;

      for (let month = 0; month < 3; month++) {
        const slotDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, targetDay);
        if (slotDate.getDate() === targetDay && slotDate >= startDate) {
          slotsToInsert.push({
            slot_date: slotDate.toISOString().split('T')[0],
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            max_bookings: newSlot.max_bookings,
            description: newSlot.description || null,
            created_by: user?.id,
          });
        }
      }
    }

    const { error } = await supabase
      .from('appointment_slots')
      .insert(slotsToInsert);

    if (error) {
      console.error('Error adding slot:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      alert('Error: ' + error.message);
    } else {
      console.log('Slot(s) added successfully');
      fetchSlots();
      setShowSlotForm(false);
      setNewSlot({
        slot_date: '',
        start_time: '',
        end_time: '',
        max_bookings: 1,
        description: '',
        recurrence: 'none',
        selectedDays: [],
        monthlyDay: 1,
        recurrenceEndDate: ''
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

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTestimonial.client_name || !newTestimonial.content) {
      console.error('Missing required fields');
      return;
    }

    const { error } = await supabase
      .from('testimonials')
      .insert({
        client_name: newTestimonial.client_name,
        content: newTestimonial.content,
        language: newTestimonial.language,
        is_approved: false,
      });

    if (error) {
      console.error('Error adding testimonial:', error);
      alert('Error: ' + error.message);
    } else {
      fetchTestimonials();
      setShowTestimonialForm(false);
      setNewTestimonial({
        client_name: '',
        content: '',
        language: 'ht'
      });
    }
  };

  const handleApproveTestimonial = async (id: string) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      console.error('Error approving testimonial:', error);
    } else {
      fetchTestimonials();
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
    } else {
      fetchTestimonials();
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

  const handleReject = async (id: string, reason: string) => {
    const { error } = await supabase
      .from('pre_consultations')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting consultation:', error);
    } else {
      fetchConsultations();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRejectId(null);
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

  const handleMarkFulfilled = async (id: string) => {
    const { error } = await supabase.rpc('mark_consultation_fulfilled', {
      p_consultation_id: id
    });

    if (error) {
      console.error('Error marking consultation as fulfilled:', error);
      alert('Error al marcar como cumplida: ' + error.message);
    } else {
      // Fetch consultations after marking
      const { data, error: fetchError } = await supabase
        .from('pre_consultations')
        .select('*, appointment_slots(*)')
        .order('created_at', { ascending: false });

      if (!fetchError) {
        setConsultations(data || []);
      }
    }
  };

  const handleMarkUnfulfilled = async (id: string) => {
    if (!confirm('¿Está seguro de que desea marcar esta consulta como incumplida? Esto notificará que debe contactar al cliente.')) {
      return;
    }

    const { error } = await supabase.rpc('mark_consultation_unfulfilled', {
      p_consultation_id: id
    });

    if (error) {
      console.error('Error marking consultation as unfulfilled:', error);
      alert('Error al marcar como incumplida: ' + error.message);
    } else {
      // Fetch consultations after marking
      const { data, error: fetchError } = await supabase
        .from('pre_consultations')
        .select('*, appointment_slots(*)')
        .order('created_at', { ascending: false });

      if (!fetchError) {
        setConsultations(data || []);
      }
    }
  };

  const checkUnfulfilledConsultations = async () => {
    const { error } = await supabase.rpc('check_unfulfilled_consultations');
    if (error) {
      console.error('Error checking unfulfilled consultations:', error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('Attempting to delete consultation with ID:', id);

    if (!confirm('¿Está seguro de que desea eliminar esta solicitud? Esta acción no se puede deshacer.')) {
      console.log('Delete cancelled by user');
      return;
    }

    console.log('Deleting consultation ID:', id);

    const { error, data } = await supabase
      .from('pre_consultations')
      .delete()
      .eq('id', id)
      .select();

    console.log('Delete result:', { error, data });

    if (error) {
      console.error('Error deleting consultation:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      alert('Error al eliminar la solicitud: ' + error.message);
    } else {
      console.log('Successfully deleted consultation');
      fetchConsultations();
    }
  };

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("admin.metaTitle")}</title>
        <meta name="description" content={t("admin.metaDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16">
        <Reveal delay={140}>
          <h1 className="text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
            {t("admin.heading")}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-2 font-display text-2xl text-muted italic">
            {t("admin.subtitle")}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <div className="flex justify-end mb-4">
          <Link
            to="/admin-stats"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{t("admin.viewStats")}</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-2">
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveTab('consultations')}
            className={`relative flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'consultations'
                ? 'bg-gold text-deep'
                : 'bg-navy2/40 text-ivory/70 hover:text-ivory'
            }`}
          >
            {t("admin.consultationsTab")}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          {activeTab === 'consultations' && (
            <button
              onClick={async () => {
                await checkUnfulfilledConsultations();
                await fetchConsultations();
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base bg-navy2/40 text-ivory/70 hover:text-ivory border border-gold/30"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Verificar Incumplidas
              </span>
            </button>
          )}
          {role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('slots')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'slots'
                    ? 'bg-gold text-deep'
                    : 'bg-navy2/40 text-ivory/70 hover:text-ivory'
                }`}
              >
                {t("admin.slotsTab")}
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'testimonials'
                    ? 'bg-gold text-deep'
                    : 'bg-navy2/40 text-ivory/70 hover:text-ivory'
                }`}
              >
                {t("admin.testimonialsTab")}
              </button>
            </>
          )}
        </div>

        {activeTab === 'slots' && role === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gold2">{t("admin.manageSlots")}</h2>
              <button
                onClick={() => setShowSlotForm(!showSlotForm)}
                className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors w-full sm:w-auto"
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
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.recurrence")}</label>
                    <select
                      value={newSlot.recurrence}
                      onChange={(e) => setNewSlot({ ...newSlot, recurrence: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                    >
                      <option value="none">{t("admin.recurrenceNone")}</option>
                      <option value="weekly">{t("admin.recurrenceWeekly")}</option>
                      <option value="monthly">{t("admin.recurrenceMonthly")}</option>
                    </select>
                  </div>
                  {newSlot.recurrence === 'weekly' && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-ivory mb-2">{t("admin.selectDays")}</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const days = newSlot.selectedDays.includes(index)
                                ? newSlot.selectedDays.filter(d => d !== index)
                                : [...newSlot.selectedDays, index];
                              setNewSlot({ ...newSlot, selectedDays: days });
                            }}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              newSlot.selectedDays.includes(index)
                                ? 'bg-gold text-deep'
                                : 'bg-navy border border-gold/30 text-ivory hover:bg-gold/10'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {newSlot.recurrence === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-ivory mb-2">{t("admin.monthlyDay")}</label>
                      <select
                        value={newSlot.monthlyDay}
                        onChange={(e) => setNewSlot({ ...newSlot, monthlyDay: parseInt(e.target.value) })}
                        className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {newSlot.recurrence !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-ivory mb-2">{t("admin.recurrenceEndDate")}</label>
                      <input
                        type="date"
                        value={newSlot.recurrenceEndDate}
                        onChange={(e) => setNewSlot({ ...newSlot, recurrenceEndDate: e.target.value })}
                        className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      />
                    </div>
                  )}
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

        {activeTab === 'testimonials' && role === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gold2">{t("admin.manageTestimonials")}</h2>
              <button
                onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>{t("admin.addTestimonial")}</span>
              </button>
            </div>

            {showTestimonialForm && (
              <form onSubmit={handleAddTestimonial} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.clientName")}</label>
                    <input
                      type="text"
                      value={newTestimonial.client_name}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.testimonialContent")}</label>
                    <textarea
                      value={newTestimonial.content}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ivory mb-2">{t("admin.language")}</label>
                    <select
                      value={newTestimonial.language}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, language: e.target.value })}
                      className="w-full rounded-lg border border-gold/30 bg-navy px-3 py-2 text-ivory"
                    >
                      <option value="ht">Haitian Creole</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-gold px-4 py-2 text-deep font-medium hover:bg-gold/90 transition-colors"
                  >
                    {t("admin.saveTestimonial")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTestimonialForm(false)}
                    className="rounded-lg border border-gold/30 px-4 py-2 text-ivory hover:bg-gold/10 transition-colors"
                  >
                    {t("admin.cancel")}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {testimonials.length === 0 ? (
                <p className="text-center text-ivory/80">{t("admin.noTestimonials")}</p>
              ) : (
                testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-gold2">{testimonial.client_name}</h3>
                        <p className="mt-2 text-sm text-ivory/80 italic">"{testimonial.content}"</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                          <span>{t("admin.language")}: {testimonial.language}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                            testimonial.is_approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {testimonial.is_approved ? t("admin.approved") : t("admin.pending")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!testimonial.is_approved && (
                          <button
                            onClick={() => handleApproveTestimonial(testimonial.id)}
                            className="flex items-center gap-2 rounded border border-green-500/30 px-3 py-2 text-[13px] text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            <span>{t("admin.approve")}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t("admin.deleteTestimonial")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, WhatsApp, destino o servicio..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full rounded-lg border border-gold/30 bg-navy px-3 sm:px-4 py-2 text-ivory placeholder:text-ivory/50 text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gold/30 bg-navy px-3 sm:px-4 py-2 text-ivory text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="rescheduled">Reprogramado</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="rounded-lg border border-gold/30 bg-navy px-3 sm:px-4 py-2 text-ivory text-sm"
                  placeholder="Filtrar por fecha"
                />
              </div>
              {filterSearch || filterStatus !== 'all' || filterDate ? (
                <p className="text-sm text-ivory/70">
                  Mostrando {filteredConsultations.length} de {consultations.length} solicitudes
                  {(filterSearch || filterStatus !== 'all' || filterDate) && (
                    <button
                      onClick={() => {
                        setFilterSearch('');
                        setFilterStatus('all');
                        setFilterDate('');
                      }}
                      className="ml-2 text-gold hover:text-gold/80 underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </p>
              ) : null}
            </div>

            {loadingData ? (
              <p className="text-center text-ivory/80">{t("admin.loading")}</p>
            ) : filteredConsultations.length === 0 ? (
              <p className="text-center text-ivory/80">
                {filterSearch || filterStatus !== 'all'
                  ? "No se encontraron solicitudes con los filtros aplicados"
                  : t("admin.noConsultations")
                }
              </p>
            ) : (
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <Reveal key={consultation.id} delay={100} className="rounded-[18px] border border-gold/25 bg-navy2/40 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-gold2">{consultation.full_name}</h3>
                        <p className="mt-1 text-xs sm:text-sm text-ivory/80 break-all">{consultation.email}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm text-ivory/80">{consultation.whatsapp}</p>
                          {consultation.whatsapp && (
                            <a
                              href={`https://wa.me/${consultation.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors"
                              title="Contactar por WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                        {consultation.destination_country && (
                          <p className="mt-2 text-xs sm:text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Destino:</span> {consultation.destination_country}
                          </p>
                        )}
                        {consultation.service_type && (
                          <p className="mt-1 text-xs sm:text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Servicio:</span> {consultation.service_type}
                          </p>
                        )}
                        {consultation.slot_id && consultation.appointment_slots && (
                          <p className="mt-1 text-xs sm:text-sm text-ivory/70">
                            <span className="font-mono text-gold/60">Créneau:</span> {new Date(consultation.appointment_slots.slot_date).toLocaleDateString('fr-FR')} {consultation.appointment_slots.start_time}
                          </p>
                        )}
                        <p className="mt-2 text-[10px] sm:text-xs text-muted">
                          {t("admin.submitted")}: {new Date(consultation.created_at).toLocaleDateString()}
                        </p>
                        {consultation.scheduled_date && (
                          <p className="mt-1 text-[10px] sm:text-xs text-muted">
                            {t("admin.scheduledDate")}: {new Date(consultation.scheduled_date).toLocaleDateString()}
                          </p>
                        )}
                        {consultation.fulfillment_status && (
                          <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] sm:text-xs font-medium ${
                            consultation.fulfillment_status === 'fulfilled'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {consultation.fulfillment_status === 'fulfilled' ? '✓ Cumplida' : '⚠ Incumplida'}
                          </div>
                        )}
                        {consultation.scheduled_date && consultation.status === 'approved' && !consultation.fulfillment_status && new Date(consultation.scheduled_date) < new Date() && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] sm:text-xs text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Fecha pasada - Contactar cliente</span>
                          </div>
                        )}
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] sm:text-xs font-medium"
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
                      <div className="flex flex-row sm:flex-col gap-2 mt-4 sm:mt-0 overflow-x-auto">
                        {consultation.payment_proof_url && (
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowProofModal(true);
                            }}
                            className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[12px] sm:text-[13px] text-gold2 hover:bg-gold/10 transition-colors whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4" />
                            <span>{t("admin.viewProof")}</span>
                          </button>
                        )}
                        {consultation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(consultation.id)}
                              className="flex items-center gap-2 rounded border border-green-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-green-400 hover:bg-green-500/10 transition-colors whitespace-nowrap"
                            >
                              <Check className="h-4 w-4" />
                              <span>{t("admin.approve")}</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRejectId(consultation.id);
                                setShowRejectModal(true);
                              }}
                              className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                            >
                              <X className="h-4 w-4" />
                              <span>{t("admin.reject")}</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="rounded border border-gold/30 bg-navy px-2 py-1 text-[12px] sm:text-[13px] text-ivory"
                              />
                              <button
                                onClick={() => handleReschedule(consultation.id)}
                                className="flex items-center gap-2 rounded border border-yellow-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-yellow-400 hover:bg-yellow-500/10 transition-colors whitespace-nowrap"
                              >
                                <Calendar className="h-4 w-4" />
                                <span>{t("admin.reschedule")}</span>
                              </button>
                            </div>
                          </>
                        )}
                        {consultation.status === 'rejected' && (
                          <button
                            onClick={() => handleDelete(consultation.id)}
                            className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                            title="Eliminar solicitud"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                        {(consultation.status === 'approved' || consultation.status === 'rescheduled') && !consultation.fulfillment_status && (
                          <>
                            <button
                              onClick={() => handleMarkFulfilled(consultation.id)}
                              className="flex items-center gap-2 rounded border border-green-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-green-400 hover:bg-green-500/10 transition-colors whitespace-nowrap"
                              title="Marcar como cumplida"
                            >
                              <Check className="h-4 w-4" />
                              <span>Cumplida</span>
                            </button>
                            <button
                              onClick={() => handleMarkUnfulfilled(consultation.id)}
                              className="flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-[12px] sm:text-[13px] text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
                              title="Marcar como incumplida"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <span>Incumplida</span>
                            </button>
                          </>
                        )}
                        {consultation.fulfillment_status === 'unfulfilled' && (
                          <a
                            href={`tel:${consultation.whatsapp}`}
                            className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[12px] sm:text-[13px] text-gold2 hover:bg-gold/10 transition-colors whitespace-nowrap"
                            title="Llamar al cliente"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Contactar</span>
                          </a>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="max-w-4xl w-full rounded-[18px] border border-gold/25 bg-navy2/40 p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-gold2">{t("admin.paymentProof")}</h3>
              <div className="flex items-center gap-2">
                {selectedConsultation.payment_proof_url?.toLowerCase().endsWith('.pdf') && (
                  <a
                    href={selectedConsultation.payment_proof_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-gold2 hover:bg-gold/10 transition-all"
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setImageZoom(1);
                    setImageRotation(0);
                  }}
                  className="text-ivory/70 hover:text-ivory"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            {!selectedConsultation.payment_proof_url?.toLowerCase().endsWith('.pdf') && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                  className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-sm text-gold2 hover:bg-gold/10 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span>+</span>
                </button>
                <button
                  onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-sm text-gold2 hover:bg-gold/10 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span>-</span>
                </button>
                <button
                  onClick={() => setImageRotation(prev => prev + 90)}
                  className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-sm text-gold2 hover:bg-gold/10 transition-colors"
                  title="Rotar"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>90°</span>
                </button>
                <button
                  onClick={() => {
                    setImageZoom(1);
                    setImageRotation(0);
                  }}
                  className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-sm text-gold2 hover:bg-gold/10 transition-colors"
                  title="Restablecer"
                >
                  <span>Reset</span>
                </button>
                <span className="text-sm text-ivory/70 ml-auto">
                  {Math.round(imageZoom * 100)}%
                </span>
              </div>
            )}
            <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-navy/50 rounded-lg">
              {selectedConsultation.payment_proof_url?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedConsultation.payment_proof_url}
                  className="w-full h-full min-h-[500px] rounded-lg"
                  title="Payment proof PDF"
                />
              ) : (
                <img
                  src={selectedConsultation.payment_proof_url}
                  alt="Payment proof"
                  className="transition-transform duration-200 rounded-lg"
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="max-w-md w-full rounded-[18px] border border-gold/25 bg-navy2/40 p-4 sm:p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-gold2">{t("admin.rejectReasonTitle")}</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRejectId(null);
                }}
                className="text-ivory/70 hover:text-ivory"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("admin.rejectReasonPlaceholder")}
              className="w-full rounded-lg border border-gold/30 bg-navy px-4 py-3 text-ivory min-h-[120px] mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedRejectId && rejectReason.trim()) {
                    handleReject(selectedRejectId, rejectReason);
                  }
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("admin.confirmReject")}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRejectId(null);
                }}
                className="flex-1 rounded-lg border border-gold/30 px-4 py-2 text-ivory hover:bg-gold/10 transition-colors"
              >
                {t("admin.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
