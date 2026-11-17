-- =============================================
-- Auto-close inactive chat conversations
-- =============================================

-- Function to close conversations inactive for more than 5 minutes
CREATE OR REPLACE FUNCTION close_inactive_conversations()
RETURNS void AS $$
BEGIN
  -- Close conversations where no messages have been sent in the last 5 minutes
  UPDATE chat_conversations
  SET status = 'closed'
  WHERE status IN ('active', 'escalated')
    AND updated_at < NOW() - INTERVAL '5 minutes'
    AND id NOT IN (
      SELECT DISTINCT conversation_id
      FROM chat_messages
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION close_inactive_conversations() TO authenticated;

-- Note: This function should be called periodically (e.g., every minute)
-- The ChatAutoCloser component in the frontend calls this function every minute
