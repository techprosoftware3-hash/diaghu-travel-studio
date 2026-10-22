import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFloat() {
  const { t } = useTranslation();

  return (
    <a
      href={whatsappLink(t("contact.whatsappMessage"))}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 md:bottom-8 md:right-8"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
