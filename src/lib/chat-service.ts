import { supabase } from '@/supabase/client';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'staff';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  session_id: string;
  user_id: string | null;
  language: string;
  status: 'active' | 'escalated' | 'closed';
  escalated_to: string | null;
  escalated_at: string | null;
  created_at: string;
  updated_at: string;
  intake_answers?: Record<number, string> | null;
  payment_proof_url?: string | null;
  payment_uploaded_at?: string | null;
}

// Generate or get session ID from localStorage
export function getSessionId(): string {
  let sessionId = localStorage.getItem('lucie_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('lucie_session_id', sessionId);
  }
  return sessionId;
}

// Check if user has an active conversation
export async function hasActiveConversation(): Promise<boolean> {
  const sessionId = getSessionId();
  const authUser = (await supabase.auth.getUser()).data.user;

  let userId = null;
  if (authUser?.id) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userRecord) {
      userId = userRecord.id;
    }
  }

  // If user is authenticated, check for active conversations by user_id
  // This prevents users from creating multiple chats
  if (userId) {
    const { data: activeConv } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'escalated'])
      .maybeSingle();

    if (activeConv) {
      return true;
    }
  }

  // For anonymous users, check by session_id
  const { data: activeConv } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('session_id', sessionId)
    .in('status', ['active', 'escalated'])
    .maybeSingle();

  return !!activeConv;
}

// Create or get conversation
export async function getOrCreateConversation(language: string = 'es'): Promise<ChatConversation> {
  const sessionId = getSessionId();
  const authUser = (await supabase.auth.getUser()).data.user;

  // Verify if user exists in users table before using user_id
  let userId = null;
  if (authUser?.id) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userRecord) {
      userId = userRecord.id;
    }
  }

  // If user is authenticated, first check if they already have an active conversation
  // This check happens BEFORE any session_id manipulation, preventing multiple chats
  if (userId) {
    const { data: activeConv } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'escalated'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeConv) {
      console.log('User already has an active conversation, returning it:', activeConv.id);
      // Update session_id to match current session (prevents session_id conflict)
      if (activeConv.session_id !== sessionId) {
        await supabase
          .from('chat_conversations')
          .update({ session_id: sessionId })
          .eq('id', activeConv.id);
      }
      return activeConv;
    }
  }

  // Try to get existing conversation by session_id (for anonymous users or logged in users without active conv)
  const { data: existingConv, error: fetchError } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingConv && !fetchError) {
    // If user is now logged in but conversation doesn't have user_id, update it
    if (userId && !existingConv.user_id) {
      const { data: updatedConv, error: updateError } = await supabase
        .from('chat_conversations')
        .update({ user_id: userId })
        .eq('id', existingConv.id)
        .select()
        .single();

      if (!updateError && updatedConv) {
        return updatedConv;
      }
    }

    // If conversation exists but is closed, reactivate it
    if (existingConv.status === 'closed') {
      const { data: updatedConv, error: updateError } = await supabase
        .from('chat_conversations')
        .update({
          status: 'active',
          language,
          escalated_to: null
        })
        .eq('id', existingConv.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error reactivating conversation:', updateError);
        throw updateError;
      }
      return updatedConv;
    }
    return existingConv;
  }

  // Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from('chat_conversations')
    .insert({
      session_id: sessionId,
      user_id: userId,
      language,
      status: 'active'
    })
    .select()
    .single();

  // If there's a conflict (session_id already exists), try to fetch it again
  if (createError && createError.code === '23505') {
    console.log('Conversation already exists, fetching it...');
    const { data: retryConv, error: retryError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (retryConv && !retryError) {
      // Also update user_id if user is now logged in
      if (userId && !retryConv.user_id) {
        const { data: updatedConv } = await supabase
          .from('chat_conversations')
          .update({ user_id: userId })
          .eq('id', retryConv.id)
          .select()
          .single();

        if (updatedConv) {
          return updatedConv;
        }
      }
      return retryConv;
    }
    if (retryError) {
      console.error('Error fetching existing conversation after conflict:', retryError);
      throw retryError;
    }
  }

  if (createError) {
    console.error('Error creating conversation:', createError);
    throw createError;
  }

  return newConv;
}

// Save message to database
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'staff',
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content
    });

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

// Get conversation messages
export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data || [];
}

// Escalate conversation to staff
export async function escalateConversation(conversationId: string): Promise<void> {
  console.log('Escalating conversation:', conversationId);

  // First check if already escalated
  const { data: existingConv } = await supabase
    .from('chat_conversations')
    .select('status, escalated_to')
    .eq('id', conversationId)
    .single();

  if (existingConv && existingConv.status === 'escalated') {
    console.log('Conversation already escalated, skipping');
    return;
  }

  const { error } = await supabase
    .from('chat_conversations')
    .update({
      status: 'escalated',
      escalated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error escalating conversation:', error);
    throw error;
  }
  console.log('Conversation escalated successfully');
}

// Staff: Take over escalated conversation
export async function takeOverConversation(conversationId: string, staffId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({
      escalated_to: staffId,
      status: 'active'
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error taking over conversation:', error);
    throw error;
  }

  // Get staff info
  const { data: staff } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', staffId)
    .single();

  // Send system message
  const staffName = staff?.full_name || 'Agente';
  const systemMessage = `👤 ${staffName} ha tomado tu conversación.\n\nAhora continuarás chateando directamente con el asesor humano. Lucie dejará de responder.\n\n💬 El agente también te contactará por WhatsApp.`;

  await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: systemMessage
    });
}

// Staff: Get all escalated conversations
export async function getEscalatedConversations(): Promise<ChatConversation[]> {
  console.log('Fetching escalated conversations...');
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('status', 'escalated')
    .is('escalated_to', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching escalated conversations:', error);
    throw error;
  }

  console.log('Escalated conversations found:', data?.length || 0);
  console.log('Escalated conversations data:', data);
  return data || [];
}

// Staff: Get conversations assigned to me (excluding closed ones)
export async function getMyConversations(staffId: string): Promise<ChatConversation[]> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('escalated_to', staffId)
    .neq('status', 'closed')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching my conversations:', error);
    throw error;
  }

  return data || [];
}

// Close conversation
export async function closeConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({ status: 'closed' })
    .eq('id', conversationId);

  if (error) {
    console.error('Error closing conversation:', error);
    throw error;
  }
}

// Get staff member info who took over the conversation
export async function getStaffInfo(staffId: string): Promise<{ full_name: string; avatar_url?: string } | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('full_name, avatar_url')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      // If avatar_url column doesn't exist, try without it
      if (error.code === '42703') {
        const { data: dataWithoutAvatar, error: errorWithoutAvatar } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', staffId)
          .maybeSingle();

        if (errorWithoutAvatar) {
          console.error('Error fetching staff info:', errorWithoutAvatar);
          return null;
        }

        return dataWithoutAvatar ? { full_name: dataWithoutAvatar.full_name, avatar_url: undefined } : null;
      }

      console.error('Error fetching staff info:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching staff info:', error);
    return null;
  }
}

// Save intake answers to conversation
export async function saveIntakeAnswers(conversationId: string, answers: Record<number, string>): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({ intake_answers: answers })
    .eq('id', conversationId);

  if (error) {
    console.error('Error saving intake answers:', error);
    throw error;
  }
}

// Save payment proof URL to conversation
export async function savePaymentProof(conversationId: string, paymentProofUrl: string): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({
      payment_proof_url: paymentProofUrl,
      payment_uploaded_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error saving payment proof:', error);
    throw error;
  }
}

// Get conversation with intake and payment info
export async function getConversationWithDetails(conversationId: string): Promise<ChatConversation | null> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation details:', error);
    return null;
  }

  return data;
}

