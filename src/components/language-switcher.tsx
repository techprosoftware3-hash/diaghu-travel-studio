import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "es", label: "ES", name: "Español" },
  { code: "ht", label: "HT", name: "Kreyòl" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Change language"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/30 text-gold2 hover:bg-gold/10 transition-colors"
      >
        <Languages className="h-4 w-4" />
        <span className="font-mono text-xs font-semibold">
          {LANGUAGES.find((lang) => lang.code === i18n.language)?.label || "FR"}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 z-50">
          <div className="bg-navy border border-gold/30 rounded-lg overflow-hidden shadow-xl">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  i18n.language === lang.code
                    ? "bg-gold/20 text-gold2 font-semibold"
                    : "text-ivory/80 hover:bg-gold/10 hover:text-ivory"
                )}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
