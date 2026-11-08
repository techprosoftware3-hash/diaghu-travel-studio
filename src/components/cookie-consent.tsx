import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export function CookieConsent() {
  const { t } = useTranslation();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy2/95 backdrop-blur-sm border-t border-gold/30 p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-ivory/90 leading-relaxed">
              {t('cookieConsent.message')}
            </p>
            <a
              href="/privacy"
              className="text-xs text-gold hover:text-gold/80 underline mt-2 inline-block"
            >
              {t('cookieConsent.learnMore')}
            </a>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gold/30 text-ivory/70 hover:bg-gold/10 transition-colors text-sm"
            >
              {t('cookieConsent.reject')}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gold text-deep font-medium hover:bg-gold/90 transition-colors text-sm"
            >
              {t('cookieConsent.accept')}
            </button>
          </div>
        </div>
        <button
          onClick={handleReject}
          className="absolute top-2 right-2 text-ivory/50 hover:text-ivory transition-colors sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
