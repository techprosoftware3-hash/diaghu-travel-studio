-- =============================================
-- Enable Realtime for Chat Tables
-- =============================================

-- Enable realtime replication for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
