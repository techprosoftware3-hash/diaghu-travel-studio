import { useEffect } from "react";
import i18n from "../lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("I18nProvider mounted, i18n.isInitialized:", i18n.isInitialized);
    console.log("i18n languages:", i18n.languages);
    console.log("i18n resources:", Object.keys(i18n.services.resourceStore.data));
  }, []);

  return <>{children}</>;
}
