import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[24px] bg-gradient-to-br from-navy2 to-navy border border-gold/40 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted hover:bg-gold/10 hover:text-gold2 transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-gold2 mb-2">
            {tab === 'login' ? t('auth.login') : t('auth.register')}
          </h2>
          <p className="text-sm text-muted">
            {tab === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte DIAGHU'}
          </p>
        </div>

        <div className="mb-6 flex gap-2 p-1 bg-navy/50 rounded-xl">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg px-4 py-3 font-display text-sm font-medium transition-all ${
              tab === 'login'
                ? 'bg-gold text-deep shadow-lg'
                : 'text-muted hover:text-ivory hover:bg-navy/50'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg px-4 py-3 font-display text-sm font-medium transition-all ${
              tab === 'register'
                ? 'bg-gold text-deep shadow-lg'
                : 'text-muted hover:text-ivory hover:bg-navy/50'
            }`}
          >
            {t('auth.register')}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ivory">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ivory">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold2 px-4 py-4 font-display font-bold text-deep hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 transition-all"
            >
              {loading ? t('auth.loading') : t('auth.loginButton')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-ivory">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="Votre nom complet"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ivory">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ivory">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gold/30 bg-deep/50 px-4 py-3 text-ivory placeholder:text-muted/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-gold to-gold2 px-4 py-4 font-display font-bold text-deep hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 transition-all"
            >
              {loading ? t('auth.loading') : t('auth.registerButton')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
