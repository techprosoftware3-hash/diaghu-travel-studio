import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";

export function AdminNotificationBadge() {
  const { user, role } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const channelRef = useRef<any>(null);

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

    // Subscribe to real-time updates - use a unique channel name to avoid conflicts
    const channelName = `pre_consultations_changes_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
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
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription established');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
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
