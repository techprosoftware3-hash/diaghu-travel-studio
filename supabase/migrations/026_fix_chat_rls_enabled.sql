-- =============================================
-- Fix: Enable RLS and ensure proper policies for chat tables
-- =============================================
-- This migration ensures RLS is ENABLED and policies are correct
-- The previous migration 016 disabled RLS, and 025 recreated policies but didn't re-enable RLS

-- Enable RLS on both tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure clean state
DROP POLICY IF EXISTS "Anyone can create chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can view all conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can update conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can view own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff and admin can view all chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff and admin can update chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Anyone can create chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can view all messages" ON chat_conversations;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Staff and admin can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Staff and admin can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Staff can view all messages" ON chat_messages;

-- Recreate policies for chat_conversations

-- Anyone can create chat conversations (for anonymous users)
CREATE POLICY "Anyone can create chat conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (true);

-- Users can view their own conversations (by user_id OR session_id)
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (
    auth.uid() = user_id
    OR session_id IS NOT NULL
  );

-- Staff can view all conversations
CREATE POLICY "Staff can view all conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Users can update their own conversations (by user_id OR session_id)
CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (
    auth.uid() = user_id
    OR session_id IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = user_id
    OR session_id IS NOT NULL
  );

-- Staff can update any conversation
CREATE POLICY "Staff can update conversations"
  ON chat_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Recreate policies for chat_messages

-- Anyone can create messages (for conversation flow - anonymous users included)
CREATE POLICY "Anyone can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Users can view messages in their own conversations
CREATE POLICY "Users can view messages in own conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND (chat_conversations.user_id = auth.uid() OR chat_conversations.session_id IS NOT NULL)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Staff can view all messages
CREATE POLICY "Staff can view all messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
    )
  );

-- Ensure realtime is enabled for these tables (ignore if already added)
DO $$
BEGIN
  -- Add chat_conversations if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'chat_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
  END IF;

  -- Add chat_messages if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
END $$;
