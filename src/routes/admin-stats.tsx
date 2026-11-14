import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { ArrowLeft, Users, Globe, TrendingUp, Calendar, Activity } from "lucide-react";

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

  useEffect(() => {
    if (!loading && (role !== 'admin' && role !== 'staff')) {
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
    setLoadingData(false);
  };

  const totalVisits = siteVisits.length;
  const uniqueSessions = new Set(siteVisits.map(v => v.session_id)).size;

  const countryStats = siteVisits.reduce((acc, visit) => {
    const country = visit.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityStats = siteVisits.reduce((acc, visit) => {
    const city = visit.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Visits by date (last 7 days)
  const visitsByDate = siteVisits.reduce((acc, visit) => {
    const date = new Date(visit.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent visits
  const recentVisits = siteVisits.slice(0, 20);

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
        <div className="rounded-[18px] border-2 border-green-500/50 bg-green-500/10 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-green-400" size={32} />
              <div>
                <h3 className="font-display text-xl font-bold text-green-400">{t("adminStats.liveSessions")}</h3>
                <p className="text-sm text-green-400/70">{t("adminStats.liveSessionsDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-5xl font-bold text-green-400">{liveSessions}</p>
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
