-- =============================================
-- Fix RLS policies for chat tables - DISABLE RLS for simplicity
-- =============================================

-- Disable RLS for chat tables to allow full access
ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled, use these simplified policies instead:
-- DROP ALL POLICIES ON chat_conversations;
-- DROP ALL POLICIES ON chat_messages;
--
-- CREATE POLICY "Enable all access for chat conversations" ON chat_conversations FOR ALL USING (true);
-- CREATE POLICY "Enable all access for chat messages" ON chat_messages FOR ALL USING (true);
