import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { X } from 'lucide-react';

export function PhoneUpdateModal() {
  const { t } = useTranslation();
  const { needsPhoneUpdate, updateUserPhone, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!needsPhoneUpdate || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone) {
      setError(t('auth.phoneRequired') || 'Por favor ingresa tu número de WhatsApp');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      setError(t('auth.phoneInvalid') || 'Número de teléfono inválido. Usa formato internacional (+ país)');
      setLoading(false);
      return;
    }

    const { error } = await updateUserPhone(phone);

    if (error) {
      setError(t('auth.registrationError') || 'Error al actualizar el número de teléfono');
    } else {
      setPhone('');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-navy2 to-navy border border-gold/40 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-gold2 mb-2">
            📱 {t('auth.phoneRequired') || 'Número de WhatsApp Requerido'}
          </h2>
          <p className="text-sm text-ivory/70">
            Para poder contactarte, necesitamos tu número de WhatsApp.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ivory">
              {t('auth.whatsapp')} *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
              placeholder="+509 1234 5678"
              required
            />
            <p className="text-xs text-ivory/50 mt-1">Formato internacional (ej: +509 1234 5678)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-gold to-gold2 px-4 py-4 font-display font-bold text-deep hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 transition-all"
          >
            {loading ? t('auth.loading') : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}
