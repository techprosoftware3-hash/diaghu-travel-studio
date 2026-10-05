import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { BTN_GOLD } from "@/lib/styles";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth-modal";
import emblem from "@/assets/emblem.png";

const LINK = "text-ivory transition-colors hover:text-gold2";

function NavLinks({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Link to="/" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">01</span>{t("site.home")}
      </Link>
      <Link to="/a-propos" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">02</span>{t("site.aboutUs")}
      </Link>
      <Link to="/services" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">03</span>{t("site.services")}
      </Link>
      <Link to="/destinations" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">04</span>{t("site.destinations")}
      </Link>
      <Link to="/pre-consultation" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">05</span>{t("site.preConsultation")}
      </Link>
      <Link to="/randevou" className={cn(LINK, className)}>
        <span className="mr-2 font-mono text-gold/60">06</span>{t("site.contactUs")}
      </Link>
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { user, role, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-navy/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6 md:h-20">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={emblem}
            alt="DIAGHU Logo"
            className="h-16 w-16 object-contain pulse-zoom md:h-22 md:w-22"
          />
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-wide text-gold2">
              DIAGHU
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold/70">
              {t("site.subtitle")}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] tracking-wide md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user && (role === 'admin' || role === 'staff') && (
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[13px] text-gold2 hover:bg-gold/10 transition-colors"
              title={t("site.adminDashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t("site.adminDashboard")}</span>
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[13px] text-gold2 hover:bg-gold/10 transition-colors"
              title={t("site.logout")}
            >
              <LogOut className="h-4 w-4" />
              <span>{t("site.logout")}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="hidden md:flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-[13px] text-gold2 hover:bg-gold/10 transition-colors"
              title={t("site.login")}
            >
              <LogIn className="h-4 w-4" />
              <span>{t("site.login")}</span>
            </button>
          )}
          {/* <Link to="/randevou" className={cn(BTN_GOLD, "hidden px-4 py-2 text-[13px] md:inline-flex")}>
            {t("site.takeAppointment")}
          </Link> */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t("site.closeMenu") : t("site.openMenu")}
            className="grid h-10 w-10 place-items-center rounded-[10px] border border-gold/30 text-gold2 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gold/15 bg-navy px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <NavLinks />
            {/* <Link to="/randevou" className={cn(BTN_GOLD, "mt-2 w-full")}>
              {t("site.takeAppointment")}
            </Link> */}
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              04 · {t("site.home")} — {t("site.aboutUs")}
            </p>
          </div>
        </nav>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </header>
  );
}
