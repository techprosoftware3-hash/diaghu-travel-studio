import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "../locales/fr.json";
import es from "../locales/es.json";
import ht from "../locales/ht.json";

const resources = {
  fr: { translation: fr as any },
  es: { translation: es as any },
  ht: { translation: ht as any },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
