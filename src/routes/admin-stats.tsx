import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { ArrowLeft, Users, Globe, TrendingUp, Calendar, Activity, Filter } from "lucide-react";

export const Route = createFileRoute("/admin-stats")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminStats,
});

function AdminStats() {
  const { t } = useTranslation();
  const { user, role, loading } = useAuth();
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [liveSessions, setLiveSessions] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const fetchSiteVisits = async () => {
    try {
      let allVisits: any[] = [];
      let hasMore = true;
      let from = 0;
      const pageSize = 1000;

      while (hasMore) {
        const { data, error } = await supabase
          .from('site_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching site visits:', error);
          setLoadingData(false);
          return;
        }

        if (data && data.length > 0) {
          allVisits = [...allVisits, ...data];
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      setSiteVisits(allVisits);
    } catch (error) {
      console.error('Error fetching site visits:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // Only redirect if we're not loading and the user has a role that's not admin/staff
    // If role is null but user exists, wait for role to be determined
    if (!loading && role && role !== 'admin' && role !== 'staff') {
      window.location.href = '/';
    }
  }, [loading, role]);

  useEffect(() => {
    if (role === 'admin' || role === 'staff') {
      fetchSiteVisits();
    }
  }, [role]);

  // Calculate live sessions (visits in the last 5 minutes)
  useEffect(() => {
    const calculateLiveSessions = () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const live = siteVisits.filter(
        v => new Date(v.created_at) > fiveMinutesAgo
      ).length;
      setLiveSessions(live);
    };

    calculateLiveSessions();

    // Update every 30 seconds
    const interval = setInterval(calculateLiveSessions, 30000);
    return () => clearInterval(interval);
  }, [siteVisits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep font-body text-ivory flex items-center justify-center">
        <p>{t("admin.loading")}</p>
      </div>
    );
  }

  // If not authenticated or not authorized, redirect
  if (!role || (role !== 'admin' && role !== 'staff')) {
    window.location.href = '/';
    return null;
  }

  // Get available months from visits
  const availableMonths = Array.from(
    new Set(
      siteVisits.map(v => {
        const date = new Date(v.created_at);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  // Filter visits by selected month
  const filteredVisits = selectedMonth === 'all'
    ? siteVisits
    : siteVisits.filter(v => {
        const date = new Date(v.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });

  const totalVisits = filteredVisits.length;
  const uniqueSessions = new Set(filteredVisits.map(v => v.session_id)).size;

  const countryStats = filteredVisits.reduce((acc, visit) => {
    const country = visit.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityStats = filteredVisits.reduce((acc, visit) => {
    const city = visit.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Visits by date (last 7 days)
  const visitsByDate = filteredVisits.reduce((acc, visit) => {
    const date = new Date(visit.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent visits
  const recentVisits = filteredVisits.slice(0, 20);

  return (
    <div className="min-h-screen bg-deep font-body text-ivory">
      <Helmet>
        <title>{t("adminStats.metaTitle")}</title>
        <meta name="description" content={t("adminStats.metaDescription")} />
      </Helmet>
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          {t("adminStats.backToAdmin")}
        </Link>

        <h1 className="text-balance font-display text-5xl leading-[0.95] font-black tracking-tight text-gold2 md:text-7xl">
          {t("adminStats.heading")}
        </h1>
        <p className="mt-2 font-display text-2xl text-muted italic">
          {t("adminStats.subtitle")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        {/* Month Filter */}
        <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="text-gold" size={20} />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold2 mb-2">
                Filtrar por mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full max-w-xs bg-navy border border-gold/30 rounded-lg px-3 py-2 text-ivory focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="all">Todos los meses</option>
                {availableMonths.map(month => {
                  const [year, monthNum] = month.split('-');
                  const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                  return (
                    <option key={month} value={month}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm text-ivory/60">
                {selectedMonth === 'all' ? 'Todas las visitas' : 'Visitas filtradas'}
              </p>
              <p className="text-2xl font-bold text-gold">{totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border-2 border-green-500/50 bg-green-500/10 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-green-400" size={20} />
              <div>
                <h3 className="font-display text-sm font-bold text-green-400">{t("adminStats.liveSessions")}</h3>
                <p className="text-xs text-green-400/70">{t("adminStats.liveSessionsDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-2xl font-bold text-green-400">{liveSessions}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-gold" size={24} />
              <h3 className="font-display text-lg font-bold text-gold2">{t("adminStats.totalVisits")}</h3>
            </div>
            <p className="text-4xl font-bold text-ivory">{totalVisits}</p>
          </div>
          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-gold" size={24} />
              <h3 className="font-display text-lg font-bold text-gold2">{t("adminStats.uniqueSessions")}</h3>
            </div>
            <p className="text-4xl font-bold text-ivory">{uniqueSessions}</p>
          </div>
          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="text-gold" size={24} />
              <h3 className="font-display text-lg font-bold text-gold2">{t("adminStats.countries")}</h3>
            </div>
            <p className="text-4xl font-bold text-ivory">{Object.keys(countryStats).length}</p>
          </div>
          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-gold" size={24} />
              <h3 className="font-display text-lg font-bold text-gold2">{t("adminStats.cities")}</h3>
            </div>
            <p className="text-4xl font-bold text-ivory">{Object.keys(cityStats).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <h3 className="font-display text-xl font-bold text-gold2 mb-4">{t("adminStats.visitsByCountry")}</h3>
            <div className="space-y-2">
              {Object.entries(countryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center p-3 rounded-lg bg-navy/30">
                    <span className="text-ivory/90">{country}</span>
                    <span className="text-gold font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
            <h3 className="font-display text-xl font-bold text-gold2 mb-4">{t("adminStats.visitsByCity")}</h3>
            <div className="space-y-2">
              {Object.entries(cityStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([city, count]) => (
                  <div key={city} className="flex justify-between items-center p-3 rounded-lg bg-navy/30">
                    <span className="text-ivory/90">{city}</span>
                    <span className="text-gold font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6 mb-6">
          <h3 className="font-display text-xl font-bold text-gold2 mb-4">{t("adminStats.visitsByDate")}</h3>
          <div className="space-y-2">
            {Object.entries(visitsByDate)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .slice(0, 10)
              .map(([date, count]) => (
                <div key={date} className="flex justify-between items-center p-3 rounded-lg bg-navy/30">
                  <span className="text-ivory/90">{date}</span>
                  <span className="text-gold font-bold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-gold/25 bg-navy2/40 p-6">
          <h3 className="font-display text-xl font-bold text-gold2 mb-4">{t("adminStats.recentVisits")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="text-left p-3 text-gold font-medium">{t("adminStats.date")}</th>
                  <th className="text-left p-3 text-gold font-medium">{t("adminStats.country")}</th>
                  <th className="text-left p-3 text-gold font-medium">{t("adminStats.city")}</th>
                  <th className="text-left p-3 text-gold font-medium">{t("adminStats.page")}</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-gold/10">
                    <td className="p-3 text-ivory/80 text-sm">
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-ivory/80 text-sm">{visit.country || '-'}</td>
                    <td className="p-3 text-ivory/80 text-sm">{visit.city || '-'}</td>
                    <td className="p-3 text-ivory/80 text-sm text-xs max-w-xs truncate">
                      {visit.page_url || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
