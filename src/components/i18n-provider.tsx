import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // Asegurar que i18n esté inicializado
        if (!i18n.isInitialized) {
          await i18n.init();
        }
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize i18n:", error);
        setIsReady(true); // Mostrar algo incluso si falla
      }
    };

    initI18n();
  }, [i18n]);

  if (!isReady) {
    return null; // O mostrar un loading
  }

  return <>{children}</>;
}
