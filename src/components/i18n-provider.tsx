import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!i18n.isInitialized) {
      console.log("i18n not initialized, initializing...");
      i18n.init().then(() => {
        console.log("i18n initialized successfully");
      }).catch((err) => {
        console.error("i18n initialization failed:", err);
      });
    } else {
      console.log("i18n already initialized");
    }
  }, [i18n]);

  return <>{children}</>;
}
