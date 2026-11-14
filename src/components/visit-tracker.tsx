import { useEffect } from "react";
import { supabase } from "@/supabase/client";

export function VisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get location info using ip-api.com (free, no token required)
        let country = null;
        let city = null;

        try {
          const response = await fetch('http://ip-api.com/json/');
          if (response.ok) {
            const data = await response.json();
            country = data.country;
            city = data.city;
            console.log('Location detected:', { country, city, data });
          } else {
            console.log('ip-api.com returned non-OK status:', response.status);
          }
        } catch (error) {
          console.log('Could not fetch location from ip-api.com:', error);
        }

        // Fallback to ipapi.co if ip-api.com failed
        if (!country) {
          try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
              const data = await response.json();
              country = data.country_name || data.country;
              city = data.city;
              console.log('Location from ipapi.co fallback:', { country, city, data });
            }
          } catch (error) {
            console.log('ipapi.co fallback also failed:', error);
          }
        }

        // Generate session ID
        let sessionId = sessionStorage.getItem('visit_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem('visit_session_id', sessionId);
        }

        // Track the visit
        const result = await supabase.from('site_visits').insert({
          ip_address: null, // Not sending IP for privacy
          country,
          city,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page_url: window.location.href,
          session_id: sessionId,
        });

        if (result.error) {
          console.error('Supabase insert error:', result.error);
        } else {
          console.log('Visit tracked successfully:', { country, city });
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);

  return null;
}
