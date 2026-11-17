-- =============================================
-- Chat Conversations Table for Lucie Escalation
-- =============================================

-- Chat conversation status enum
CREATE TYPE chat_status AS ENUM ('active', 'escalated', 'closed');

-- Chat conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL, -- Unique session ID for anonymous users
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional user ID if logged in
  language VARCHAR(10) DEFAULT 'es',
  status chat_status DEFAULT 'active',
  escalated_to UUID REFERENCES users(id) ON DELETE SET NULL, -- Staff member who took over
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'staff')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX idx_chat_conversations_escalated_to ON chat_conversations(escalated_to);
CREATE INDEX idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- RLS policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can create chat conversations (for anonymous users)
CREATE POLICY "Anyone can create chat conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (true);

-- Staff and admin can view all conversations
CREATE POLICY "Staff and admin can view all chat conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Staff and admin can update conversations (to take over escalated ones)
CREATE POLICY "Staff and admin can update chat conversations"
  ON chat_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Anyone can create chat messages (for conversation flow)
CREATE POLICY "Anyone can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Staff and admin can view all messages
CREATE POLICY "Staff and admin can view all chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Staff and admin can send messages to any conversation
CREATE POLICY "Staff and admin can send chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('admin', 'staff')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
