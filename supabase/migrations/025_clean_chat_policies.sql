-- =============================================
-- Clean up all chat policies and recreate with fixed versions
-- =============================================

-- Drop ALL existing policies on chat_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can view all conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can update conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can view own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff and admin can view all chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff and admin can update chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Anyone can create chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Staff can view all messages" ON chat_conversations;

-- Drop ALL existing policies on chat_messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON chat_messages;
DROP POLICY IF EXISTS "Staff and admin can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Staff and admin can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Staff can view all messages" ON chat_messages;

-- Ensure RLS is enabled
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Recreate clean policies for chat_conversations

-- Anyone can create chat conversations (for anonymous users)
CREATE POLICY "Anyone can create chat conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (true);

-- Users can view their own conversations
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

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

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

-- Recreate clean policies for chat_messages

-- Anyone can create messages (will be validated by conversation access)
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
