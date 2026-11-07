import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';

export function AutoLogoutNotification() {
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user was logged out due to inactivity
    const autoLoggedOut = sessionStorage.getItem('autoLoggedOut');
    
    if (autoLoggedOut === 'true' && !user) {
      // Show alert notification
      alert(`${t('auth.autoLogoutTitle')}\n\n${t('auth.autoLogoutMessage')}`);
      
      // Clear the flag
      sessionStorage.removeItem('autoLoggedOut');
    }
  }, [user, t]);

  return null;
}
