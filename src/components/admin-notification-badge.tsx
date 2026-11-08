import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";

export function AdminNotificationBadge() {
  const { user, role } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || (role !== 'admin' && role !== 'staff')) {
      return;
    }

    const fetchPendingCount = async () => {
      const { data, error } = await supabase
        .from('pre_consultations')
        .select('id')
        .eq('status', 'pending');

      if (!error) {
        setPendingCount(data?.length || 0);
      }
    };

    fetchPendingCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pre_consultations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pre_consultations'
        },
        () => {
          fetchPendingCount();
        }
      );

    const subscription = channel.subscribe();

    return () => {
      subscription.then((sub) => sub.unsubscribe());
    };
  }, [user, role]);

  if (pendingCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white animate-pulse">
      {pendingCount > 99 ? '99+' : pendingCount}
    </span>
  );
}
