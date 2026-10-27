import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase/client";
import { Reveal } from "./reveal";
import { CARD } from "@/lib/styles";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  client_name: string;
  content: string;
  language: string;
  created_at: string;
}

export function TestimonialsSection() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
      <Reveal delay={60}>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold text-center">
          {t("testimonials.kicker")}
        </p>
      </Reveal>
      <Reveal delay={140}>
        <h2 className="mt-5 text-balance font-display text-4xl font-black tracking-tight text-gold2 text-center md:text-5xl">
          {t("testimonials.heading")}
        </h2>
      </Reveal>
      <Reveal delay={220}>
        <p className="mt-4 font-display text-lg text-muted italic text-center">
          {t("testimonials.subtitle")}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, i) => (
          <Reveal key={testimonial.id} delay={260 + i * 60} className={CARD}>
            <div className="flex flex-col h-full">
              <Quote className="h-8 w-8 text-gold/40 mb-4" />
              <p className="flex-1 text-sm leading-relaxed text-ivory/90 italic">
                "{testimonial.content}"
              </p>
              <div className="mt-4 pt-4 border-t border-gold/20">
                <p className="text-xs font-mono text-gold/70 uppercase tracking-wider">
                  {testimonial.client_name}
                </p>
                <p className="text-xs text-muted mt-1">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
