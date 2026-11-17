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
      // Count pending pre-consultations (only for admin)
      let preConsultationCount = 0;
      if (role === 'admin') {
        const { data: preConsultations, error: preError } = await supabase
          .from('pre_consultations')
          .select('id')
          .eq('status', 'pending');

        if (!preError) {
          preConsultationCount = preConsultations?.length || 0;
        }
      }

      // Count escalated chat conversations (only for staff)
      let chatCount = 0;
      if (role === 'staff') {
        const { data: chats, error: chatError } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('status', 'escalated')
          .is('escalated_to', null)
          .not('payment_proof_url', 'is', null);

        if (!chatError) {
          chatCount = chats?.length || 0;
        }
      }

      setPendingCount(preConsultationCount + chatCount);
    };

    fetchPendingCount();

    // Subscribe to real-time updates - use a unique channel name to avoid conflicts
    const channelName = `notifications_changes_${Date.now()}`;
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
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
