import { useEffect } from "react";
import { closeInactiveConversations } from "@/lib/chat-service";

// This component automatically closes inactive chat conversations every minute
// It should be placed in the app root (e.g., in __root.tsx)

export function ChatAutoCloser() {
  useEffect(() => {
    // Close inactive conversations every minute
    const interval = setInterval(async () => {
      try {
        await closeInactiveConversations();
      } catch (error) {
        console.error('Error in auto-closing conversations:', error);
      }
    }, 60 * 1000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}
