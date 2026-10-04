import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "../locales/fr.json";
import es from "../locales/es.json";
import ht from "../locales/ht.json";

const resources = {
  fr: { translation: fr },
  es: { translation: es },
  ht: { translation: ht },
};

// Solo inicializar si no está inicializado
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
