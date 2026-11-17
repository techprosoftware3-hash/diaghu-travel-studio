import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, Minimize2, Maximize2, User, Search, Paperclip, Download, Plus, MessageSquare } from "lucide-react";
import { getLucieResponse } from "@/lib/lucie-service";
import {
  getOrCreateConversation,
  saveMessage,
  getConversationMessages,
  escalateConversation,
  getStaffInfo,
  saveIntakeAnswers,
  savePaymentProof
} from "@/lib/chat-service";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/supabase/client";
import { getQuestion, getCategory, getCompletionMessage, INTAKE_QUESTIONS } from "@/lib/intake-questions";
import { downloadIntakePDF } from "@/lib/pdf-generator";
import lucieAvatar from "@/assets/lucie-avatar.jpg";

interface Message {
  role: 'user' | 'assistant' | 'staff';
  content: string;
}

// Function to convert URLs to clickable links and bold text
function formatMessageContent(content: string) {
  // First process bold text (**text**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(content)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    // Add the bold part
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = boldRegex.lastIndex;
  }
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  // Then process URLs within each part
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return parts.map((part, partIndex) => {
    if (part.type === 'bold') {
      const urlParts = part.content.split(urlRegex);
      return (
        <strong key={partIndex}>
          {urlParts.map((urlPart, urlIndex) => {
            if (urlPart.match(urlRegex)) {
              return (
                <a
                  key={urlIndex}
                  href={urlPart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline hover:text-gold/80 break-all"
                >
                  {urlPart}
                </a>
              );
            }
            return urlPart;
          })}
        </strong>
      );
    } else {
      const urlParts = part.content.split(urlRegex);
      return urlParts.map((urlPart, urlIndex) => {
        if (urlPart.match(urlRegex)) {
          return (
            <a
              key={`${partIndex}-${urlIndex}`}
              href={urlPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline hover:text-gold/80 break-all"
            >
              {urlPart}
            </a>
          );
        }
        return urlPart;
      });
    }
  });
}

export function LucieChat() {
  const { t, i18n } = useTranslation();
  const { user, role, hasActiveConversation, checkActiveConversation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState(false);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const [isStaffTakenOver, setIsStaffTakenOver] = useState(false);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffAvatar, setStaffAvatar] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isIntakeMode, setIsIntakeMode] = useState(false);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<number, string>>({});
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getGreeting(i18n.language)
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadConversation = async () => {
    try {
      const conv = await getOrCreateConversation(i18n.language);
      setConversationId(conv.id);
      setIsEscalated(conv.status === 'escalated' || conv.escalated_to !== null);

      // Update hasActiveConversation state
      await checkActiveConversation();

      // If conversation has a staff assigned, don't show waiting indicator
      if (conv.escalated_to) {
        setIsWaitingForAgent(false);
        const staffInfo = await getStaffInfo(conv.escalated_to);
        if (staffInfo) {
          setStaffName(staffInfo.full_name);
          setStaffAvatar(staffInfo.avatar_url || null);
        }
      } else if (conv.status === 'escalated') {
        // Conversation is escalated but no staff assigned yet
        setIsWaitingForAgent(true);
      } else {
        setIsWaitingForAgent(false);
      }

      const messages = await getConversationMessages(conv.id);
      if (messages.length > 0) {
        setMessages(messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'staff', content: m.content })));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to greeting if error
      setMessages([{ role: 'assistant', content: getGreeting(i18n.language) }]);
    }
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      console.log('=== Loading Conversation History ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);

      // Get session ID from localStorage
      const sessionId = localStorage.getItem('lucie_session_id');
      console.log('Session ID:', sessionId);

      // Fetch conversations by user_id OR session_id
      let conversations = [];

      // First try by user_id
      const { data: byUser, error: errUser } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('By user_id - Error:', errUser);
      console.log('By user_id - Data:', byUser);

      if (!errUser && byUser) {
        conversations = byUser;
      }

      // If no conversations by user_id, try by session_id
      if (conversations.length === 0 && sessionId) {
        const { data: bySession, error: errSession } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('session_id', sessionId)
          .order('updated_at', { ascending: false });

        console.log('By session_id - Error:', errSession);
        console.log('By session_id - Data:', bySession);

        if (!errSession && bySession) {
          conversations = bySession;

          // Update with user_id if user is logged in
          for (const conv of conversations) {
            if (!conv.user_id && user?.id) {
              console.log('Updating conversation with user_id:', conv.id);
              await supabase
                .from('chat_conversations')
                .update({ user_id: user.id })
                .eq('id', conv.id);
            }
          }
        }
      }

      console.log('Final conversations count:', conversations.length);
      setConversationHistory(conversations);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const selectHistoricalConversation = async (convId: string) => {
    setConversationId(convId);
    setShowHistory(false);

    const messages = await getConversationMessages(convId);
    if (messages.length > 0) {
      setMessages(messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'staff', content: m.content })));
    }

    // Load conversation details
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', convId)
      .single();

    if (conv) {
      setIsEscalated(conv.status === 'escalated' || conv.escalated_to !== null);
      setIsStaffTakenOver(conv.escalated_to !== null);
      if (conv.escalated_to) {
        const staffInfo = await getStaffInfo(conv.escalated_to);
        if (staffInfo) {
          setStaffName(staffInfo.full_name);
          setStaffAvatar(staffInfo.avatar_url || null);
        }
      }
    }
  };

  const startNewConversation = async () => {
    // Check if user has an active conversation before starting a new one
    // Double-check by calling hasActiveConversation again to ensure fresh data
    const hasActive = await checkActiveConversation();
    if (hasActive || hasActiveConversation) {
      alert('Ya tienes una conversación activa. Por favor espera a que el agente complete la conversación antes de crear una nueva.');
      return;
    }

    // Clear session ID to start a new conversation
    localStorage.removeItem('lucie_session_id');
    await loadConversation();
    setShowHistory(false);
  };

  // Allow opening Lucie from outside components
  useEffect(() => {
    const handleOpenLucie = () => setIsOpen(true);
    window.addEventListener('openLucieChat', handleOpenLucie);
    return () => window.removeEventListener('openLucieChat', handleOpenLucie);
  }, []);

  // Load conversation when chat opens
  useEffect(() => {
    if (isOpen) {
      loadConversation();
      if (user) {
        loadConversationHistory();
      }
    }
  }, [isOpen, i18n.language, user]);

  // Auto-focus input when messages change
  useEffect(() => {
    if (isOpen && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen, isLoading]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId || !isOpen) return;

    // Subscribe to new messages in this conversation
    const messageSubscription = supabase
      .channel(`chat_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          // Add the new message to the chat only if it doesn't already exist
          setMessages(prev => {
            const messageExists = prev.some(m =>
              m.role === newMessage.role && m.content === newMessage.content
            );
            if (messageExists) {
              return prev;
            }
            return [...prev, {
              role: newMessage.role as 'user' | 'assistant' | 'staff',
              content: newMessage.content
            }];
          });
        }
      )
      .subscribe();

    // Subscribe to conversation status changes (when staff takes over)
    const conversationSubscription = supabase
      .channel(`chat_conversations:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `id=eq.${conversationId}`
        },
        async (payload) => {
          const updatedConv = payload.new as any;
          const oldConv = payload.old as any;

          // Check if staff just took over (escalated_to changed from null to a value)
          if (oldConv.escalated_to === null && updatedConv.escalated_to !== null) {
            // Staff has taken over - get staff info and show message
            const staffInfo = await getStaffInfo(updatedConv.escalated_to);
            setStaffName(staffInfo?.full_name || 'Agente');
            setIsEscalated(true);
            setIsWaitingForAgent(false);
            setIsStaffTakenOver(true); // Block Lucie completely

            // Add system message indicating staff has taken over
            const takeoverMessage = getStaffTakeoverMessage(i18n.language, staffInfo?.full_name);
            const systemMessage: Message = {
              role: 'assistant',
              content: takeoverMessage
            };
            setMessages(prev => [...prev, systemMessage]);
          }

          setIsEscalated(updatedConv.status === 'escalated' || updatedConv.escalated_to !== null);
          setIsStaffTakenOver(updatedConv.escalated_to !== null);

          // If a staff member is assigned, stop waiting and fetch their info
          if (updatedConv.escalated_to) {
            setIsWaitingForAgent(false);
            // Only fetch info if it's a new assignment or if we don't have the info yet
            if (updatedConv.escalated_to !== payload.old.escalated_to || !staffName) {
              const staffInfo = await getStaffInfo(updatedConv.escalated_to);
              if (staffInfo) {
                setStaffName(staffInfo.full_name);
                setStaffAvatar(staffInfo.avatar_url || null);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      conversationSubscription.unsubscribe();
    };
  }, [conversationId, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide login prompt when user logs in
  useEffect(() => {
    if (user) {
      setShowLoginPrompt(false);
    }
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if user is logged in (allow first message, then require login)
    if (!user && messages.length > 1) {
      setShowLoginPrompt(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userContent = input;
    setInput('');
    setIsLoading(true);

    // Detect language from user message
    const detectedLanguage = detectLanguage(userContent, i18n.language);

    // If user is staff and conversation is escalated, send as staff message
    if (role === 'staff' || role === 'admin') {
      if (conversationId) {
        try {
          await saveMessage(conversationId, 'staff', userContent);
        } catch (error) {
          console.error('Error saving staff message:', error);
        }
      }
      setIsLoading(false);

      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    // Handle intake mode - structured questions
    if (isIntakeMode) {
      // Save the answer
      const questionId = INTAKE_QUESTIONS[currentQuestionIndex].id;
      setIntakeAnswers(prev => ({ ...prev, [questionId]: userContent }));

      // Move to next question
      if (currentQuestionIndex < INTAKE_QUESTIONS.length - 1) {
        const nextQuestion = INTAKE_QUESTIONS[currentQuestionIndex + 1];
        const categoryLabel = getCategory(nextQuestion.category, detectedLanguage);
        const questionText = getQuestion(nextQuestion.id, detectedLanguage);

        const assistantMessage: Message = {
          role: 'assistant',
          content: `${categoryLabel}\n\n${questionText}`
        };
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentQuestionIndex(prev => prev + 1);

        if (conversationId) {
          try {
            await saveMessage(conversationId, 'assistant', assistantMessage.content);
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
      } else {
        // All questions completed
        setIntakeCompleted(true);
        setIsIntakeMode(false);

        // Save intake answers to database
        if (conversationId) {
          try {
            await saveIntakeAnswers(conversationId, intakeAnswers);
          } catch (error) {
            console.error('Error saving intake answers:', error);
          }
        }

        const completionMessage = getCompletionMessage(detectedLanguage);
        const downloadMessage = detectedLanguage === 'es'
          ? '\n\n💾 Puedes descargar el PDF con tus respuestas haciendo clic en el botón de abajo.'
          : detectedLanguage === 'fr'
          ? '\n\n💾 Vous pouvez télécharger le PDF avec vos réponses en cliquant sur le bouton ci-dessous.'
          : detectedLanguage === 'ht'
          ? '\n\n💾 Ou ka telechaje PDF a ak repons ou yo ap klike sou bouton ki anba a.'
          : '\n\n💾 You can download the PDF with your answers by clicking the button below.';

        const assistantMessage: Message = {
          role: 'assistant',
          content: completionMessage + downloadMessage
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (conversationId) {
          try {
            await saveMessage(conversationId, 'assistant', assistantMessage.content);
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
      }

      // Save user message to database
      if (conversationId) {
        try {
          await saveMessage(conversationId, 'user', userContent);
        } catch (error) {
          console.error('Error saving user message:', error);
        }
      }

      setIsLoading(false);

      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return;
    }

    // Check if user wants to start intake (request for services)
    const intakeKeywords = [
      'servicio', 'service', 'servis',
      'asistencia', 'assistance', 'asistans',
      'ayuda', 'aide', 'ede',
      'consulta', 'consultation', 'konsiltasyon',
      'información', 'information', 'enfòmasyon',
      'visa', 'visas', 'viza',
      'migración', 'migration', 'migrasyon',
      'viaje', 'voyage', 'vwayaj',
      'trámite', 'démarche', 'demach',
      'proyecto', 'projet', 'pwojè'
    ];
    const lowerContent = userContent.toLowerCase();
    const shouldStartIntake = intakeKeywords.some(keyword => lowerContent.includes(keyword));

    // Check if a staff member has taken over the conversation FIRST
    // If isStaffTakenOver is true, Lucie should stop responding immediately
    if (isStaffTakenOver) {
      // Staff has taken over - Lucie stops responding immediately
      // Still save the user message, but don't let Lucie respond
      // Add message to UI immediately (don't rely on realtime which may not work with RLS issues)
      const userMessage: Message = { role: 'user', content: userContent };
      setMessages(prev => [...prev, userMessage]);

      if (conversationId) {
        try {
          await saveMessage(conversationId, 'user', userContent);
        } catch (error) {
          console.error('Error saving user message:', error);
        }
      }
      setIsLoading(false);
      return;
    }

    // Also check database if isStaffTakenOver is false but isEscalated is true
    if (isEscalated && conversationId) {
      const { data: conv } = await supabase
        .from('chat_conversations')
        .select('escalated_to')
        .eq('id', conversationId)
        .single();

      if (conv?.escalated_to) {
        // Staff has taken over - Lucie stops responding immediately
        setIsStaffTakenOver(true);
        // Add message to UI immediately (don't rely on realtime which may not work with RLS issues)
        const userMessage: Message = { role: 'user', content: userContent };
        setMessages(prev => [...prev, userMessage]);

        if (conversationId) {
          try {
            await saveMessage(conversationId, 'user', userContent);
          } catch (error) {
            console.error('Error saving user message:', error);
          }
        }
        setIsLoading(false);
        return;
      }
    }

    if (shouldStartIntake && !isIntakeMode) {
      setIsIntakeMode(true);
      setCurrentQuestionIndex(0);

      const firstQuestion = INTAKE_QUESTIONS[0];
      const categoryLabel = getCategory(firstQuestion.category, detectedLanguage);
      const questionText = getQuestion(firstQuestion.id, detectedLanguage);

      const assistantMessage: Message = {
        role: 'assistant',
        content: `Para poder ayudarte mejor, necesito recopilar cierta información. Responde las siguientes preguntas una por una:\n\n${categoryLabel}\n\n${questionText}`
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (conversationId) {
        try {
          await saveMessage(conversationId, 'user', userContent);
          await saveMessage(conversationId, 'assistant', assistantMessage.content);
        } catch (error) {
          console.error('Error saving messages:', error);
        }
      }

      setIsLoading(false);
      return;
    }

    // Save user message to database
    if (conversationId) {
      try {
        await saveMessage(conversationId, 'user', userContent);
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }

    try {
      const response = await getLucieResponse(
        userContent,
        detectedLanguage,
        messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
      );

      // Check if AI indicates it doesn't know the answer
      if (response.includes('ESCALAR_A_HUMANO')) {
        // Replace with user-friendly message
        const escalateMessage = getEscalationMessage(detectedLanguage);
        const assistantMessage: Message = {
          role: 'assistant',
          content: escalateMessage
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Save the user-friendly message to database
        if (conversationId) {
          try {
            await saveMessage(conversationId, 'assistant', escalateMessage);
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }

        // Escalate conversation
        if (conversationId) {
          await escalateConversation(conversationId);
          setIsEscalated(true);
          setIsWaitingForAgent(true);
        }
      } else {
        // Normal response
        const assistantMessage: Message = {
          role: 'assistant',
          content: response
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to database
        if (conversationId) {
          try {
            await saveMessage(conversationId, 'assistant', response);
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }

        // Check if response contains escalation keywords (legacy)
        if (shouldEscalate(response)) {
          if (conversationId) {
            await escalateConversation(conversationId);
            setIsEscalated(true);
            setIsWaitingForAgent(true);
          }
        }
      }

      // After first response, if user is not logged in, show login prompt
      if (!user) {
        setShowLoginPrompt(true);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: getErrorMessage(detectedLanguage)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);

      // Focus input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const shouldEscalate = (response: string): boolean => {
    // Check for explicit escalation signal from AI
    if (response.includes('ESCALAR_A_HUMANO')) {
      return true;
    }

    // Check for escalation keywords (legacy support)
    const escalationKeywords = ['whatsapp', 'contact', 'llamar', 'llamen', 'llamarnos', 'contactarnos'];
    return escalationKeywords.some(keyword => response.toLowerCase().includes(keyword));
  };

  const handleDownloadPDF = () => {
    if (!conversationId) return;

    const pdfData = {
      answers: intakeAnswers,
      language: i18n.language,
      conversationId: conversationId,
      userId: user?.id,
      date: new Date().toLocaleDateString()
    };

    downloadIntakePDF(pdfData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!uploadedFile || !conversationId) return;

    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      alert('Debes iniciar sesión para subir el comprobante de pago');
      return;
    }

    // Update conversation with user_id if it's null (conversation created before login)
    try {
      const { data: convData } = await supabase
        .from('chat_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      if (convData && !convData.user_id) {
        await supabase
          .from('chat_conversations')
          .update({ user_id: user.id })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Error updating conversation user_id:', error);
    }

    // Sanitize filename to remove special characters and spaces
    const sanitizeFileName = (name: string): string => {
      // Get file extension
      const lastDotIndex = name.lastIndexOf('.');
      const extension = lastDotIndex > 0 ? name.slice(lastDotIndex) : '';
      const baseName = lastDotIndex > 0 ? name.slice(0, lastDotIndex) : name;

      // Remove special characters and replace spaces with underscores
      const sanitized = baseName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

      return sanitized + extension;
    };

    // Upload file to Supabase storage using user ID as folder (matches RLS policy)
    const fileName = `${user.id}/${conversationId}/${Date.now()}-${sanitizeFileName(uploadedFile.name)}`;
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, uploadedFile);

    if (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    // Save payment proof URL to conversation
    try {
      await savePaymentProof(conversationId, publicUrl);
    } catch (error) {
      console.error('Error saving payment proof:', error);
    }

    // Send message with file link
    const messageContent = `📎 Comprobante de pago adjuntado: ${publicUrl}`;
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);

    if (conversationId) {
      try {
        await saveMessage(conversationId, 'user', messageContent);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }

    // Escalate conversation to staff
    try {
      await escalateConversation(conversationId);
      setIsEscalated(true);
      setIsWaitingForAgent(true);
    } catch (error) {
      console.error('Error escalating conversation:', error);
    }

    // Send confirmation message to client
    const confirmationMessage = getPaymentProofConfirmationMessage(i18n.language);
    const assistantMessage: Message = { role: 'assistant', content: confirmationMessage };
    setMessages(prev => [...prev, assistantMessage]);

    if (conversationId) {
      try {
        await saveMessage(conversationId, 'assistant', confirmationMessage);
      } catch (error) {
        console.error('Error saving confirmation message:', error);
      }
    }

    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg hover:scale-110 transition-all group"
        aria-label="Chat con Lucie"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gold">
          <img
            src={lucieAvatar}
            alt="Lucie"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute -top-12 right-0 bg-deep text-gold px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap animate-bounce shadow-lg shadow-gold/50">
          {t("lucie.chatButton")}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-navy2 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gold p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-deep flex items-center justify-center bg-deep">
              {isEscalated ? (
                staffAvatar ? (
                  <img
                    src={staffAvatar}
                    alt={staffName || 'Agente'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-gold" />
                )
              ) : (
                <img
                  src={lucieAvatar}
                  alt="Lucie"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-deep">
                {isEscalated ? (staffName || 'Agente') : 'Lucie'}
              </h3>
              <p className="text-xs text-deep/70">
                {isEscalated ? t("lucie.staffTitle") : t("lucie.assistantTitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && !showHistory && (
              <button
                onClick={() => setShowHistory(true)}
                className="p-1 hover:bg-deep/20 rounded transition-colors"
                aria-label="Historial"
                title="Ver historial de conversaciones"
              >
                <MessageSquare size={18} />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-deep/20 rounded transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-deep/20 rounded transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Conversation History View */}
            {showHistory && (
              <div className="h-96 overflow-y-auto p-4 space-y-3 bg-deep scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-deep">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-bold text-gold2">Historial de Conversaciones</h4>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gold hover:text-gold/80 text-sm"
                  >
                    Volver al chat
                  </button>
                </div>
                <button
                  onClick={startNewConversation}
                  disabled={hasActiveConversation}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors mb-4 ${
                    hasActiveConversation
                      ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                      : 'bg-gold text-deep hover:bg-gold/90'
                  }`}
                >
                  <Plus size={18} />
                  <span>Nueva Conversación</span>
                </button>
                {conversationHistory.length === 0 ? (
                  <p className="text-center text-ivory/50 text-sm">No hay conversaciones anteriores</p>
                ) : (
                  conversationHistory.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => selectHistoricalConversation(conv.id)}
                      className="p-3 rounded-lg bg-navy2 border border-gold/20 hover:bg-gold/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={16} className="text-gold" />
                        <span className="text-sm font-medium text-gold2">
                          {new Date(conv.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-ivory/70">
                        {conv.status === 'escalated' ? 'Escalado' : conv.status === 'closed' ? 'Cerrado' : 'Activo'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages */}
            {!showHistory && (
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-deep scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-deep">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gold text-deep'
                        : 'bg-navy2/50 text-ivory border border-gold/20'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
                  </div>
                </div>
              ))}
              {showLoginPrompt && (
                <div className="flex justify-start">
                  <div className="bg-navy2/50 text-ivory border border-gold/20 p-3 rounded-2xl">
                    <p className="text-sm whitespace-pre-wrap">
                      {getLoginPromptMessage(i18n.language)}
                    </p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
                      className="mt-2 w-full bg-gold text-deep px-3 py-1 rounded text-sm hover:bg-gold/90 transition-colors"
                    >
                      {getLoginButtonText(i18n.language)}
                    </button>
                  </div>
                </div>
              )}
              {intakeCompleted && (
                <div className="flex justify-start">
                  <div className="bg-navy2/50 text-ivory border border-gold/20 p-3 rounded-2xl">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 w-full bg-gold text-deep px-3 py-2 rounded text-sm hover:bg-gold/90 transition-colors"
                    >
                      <Download size={16} />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              )}
              {intakeCompleted && (
                <div className="flex justify-start">
                  <div className="bg-navy2/50 text-ivory border border-gold/20 p-3 rounded-2xl">
                    <p className="text-sm mb-2">Adjuntar comprobante de pago:</p>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-navy2 border border-gold/30 px-3 py-2 rounded text-sm hover:bg-gold/10 transition-colors"
                      >
                        <Paperclip size={16} />
                        <span>{uploadedFile ? uploadedFile.name : 'Seleccionar archivo'}</span>
                      </button>
                      {uploadedFile && (
                        <button
                          onClick={handleUploadPaymentProof}
                          className="bg-gold text-deep px-3 py-2 rounded text-sm hover:bg-gold/90 transition-colors"
                        >
                          Subir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {isWaitingForAgent && (
                <div className="flex justify-start">
                  <div className="bg-navy2/50 text-ivory border border-gold/20 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Search size={16} className="text-gold animate-pulse" />
                      <p className="text-sm font-medium text-gold">
                        {getWaitingForAgentMessage(i18n.language)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-navy2/50 text-ivory border border-gold/20 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            )}

            {/* Input */}
            {!showHistory && (
              <div className="p-4 bg-navy2 border-t border-gold/20">
                {isStaffTakenOver ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-center text-sm text-ivory/70 mb-2">
                      <p>Esta conversación está siendo atendida por un agente humano.</p>
                      {role === 'staff' || role === 'admin' ? (
                        <p className="text-xs mt-1">Estás respondiendo como agente.</p>
                      ) : (
                        <>
                          <p className="text-xs mt-1">Por favor espera a que el agente responda.</p>
                          <p className="text-xs mt-1 text-green-400">💬 El agente también te contactará por WhatsApp.</p>
                        </>
                      )}
                    </div>
                    {(role === 'staff' || role === 'admin') && (
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe tu respuesta como agente..."
                          className="flex-1 bg-deep border border-gold/30 rounded-lg px-4 py-2 text-ivory placeholder:text-ivory/50 focus:outline-none focus:border-gold"
                        />
                      <button
                        onClick={async () => {
                          if (!input.trim() || !conversationId) return;

                          const messageContent = input;
                          setInput('');

                          // Add message to UI
                          const userMessage: Message = {
                            role: 'user',
                            content: messageContent
                          };
                          setMessages(prev => [...prev, userMessage]);

                          // Save to database (Lucie just transmits, doesn't respond)
                          try {
                            await saveMessage(conversationId, 'user', messageContent);
                          } catch (error) {
                            console.error('Error saving message:', error);
                          }

                          // Focus input after sending
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 100);
                        }}
                        disabled={!input.trim()}
                        className="bg-gold text-deep p-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t("lucie.placeholder")}
                      className="flex-1 bg-deep border border-gold/30 rounded-lg px-4 py-2 text-ivory placeholder:text-ivory/50 focus:outline-none focus:border-gold"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="bg-gold text-deep p-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getGreeting(language: string): string {
  const greetings: Record<string, string> = {
    es: "¡Hola! Soy Lucie, tu asistente virtual de DIAGHU. ¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte con:\n✈️ Consultas migratorias y visas\n💼 Análisis de tu proyecto de migración\n📋 Programación de citas\n\nSi tienes preguntas sobre otros temas, también puedes escribirme y te responderé con gusto.",
    fr: "Bonjour! Je suis Lucie, votre assistante virtuelle DIAGHU. Comment puis-je vous aider aujourd'hui?\n\nJe peux vous aider avec:\n✈️ Questions d'immigration et visas\n💼 Analyse de votre projet de migration\n📋 Planification de rendez-vous\n\nSi vous avez des questions sur d'autres sujets, n'hésitez pas à me les poser, je serai ravie de vous répondre.",
    ht: "Bonjou! Mwen se Lucie, asistan virtual ou DIAGHU. Kisa mwen ka ede ou jodi a?\n\nMwen ka ede ou ak:\n✈️ Kesyon imigrasyon ak viza\n💼 Analiz pwojè migrasyon ou\n📋 Planifye randevou\n\nSi ou gen kesyon sou lòt sijè, ou ka ekri yo mwen tou, mwen pral reponn ou ak plezi.",
    en: "Hello! I'm Lucie, your DIAGHU virtual assistant. How can I help you today?\n\nI can help you with:\n✈️ Immigration inquiries and visas\n💼 Analysis of your migration project\n📋 Scheduling appointments\n\nIf you have questions about other topics, feel free to ask and I'll be happy to answer."
  };
  return greetings[language] || greetings['en'] || '';
}

function getErrorMessage(language: string): string {
  const errors: Record<string, string> = {
    es: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente o contáctanos por WhatsApp.",
    fr: "Désolé, une erreur s'est produite lors du traitement de votre message. Veuillez réessayer ou contactez-nous via WhatsApp.",
    ht: "Padon, te yon erè ki fèt lè trete mesaj ou. Tanpri eseye ankò oswa kontakte nou pa WhatsApp.",
    en: "Sorry, there was an error processing your message. Please try again or contact us via WhatsApp."
  };
  return errors[language] || errors['en'] || '';
}

function getEscalatedMessage(language: string): string {
  const messages: Record<string, string> = {
    es: "Tu conversación ha sido escalada a un agente humano. Un miembro de nuestro equipo te responderá pronto.",
    fr: "Votre conversation a été transmise à un agent humain. Un membre de notre équipe vous répondra bientôt.",
    ht: "Konvèsasyon ou te eskale nan yon ajant imen. Yon manm ekip nou a pral reponn ou byento.",
    en: "Your conversation has been escalated to a human agent. A team member will respond to you shortly."
  };
  return messages[language] || messages['en'] || '';
}

function getEscalationMessage(language: string): string {
  const messages: Record<string, string> = {
    es: "Esta consulta requiere asesoría personalizada. Te voy a conectar con un agente humano que te ayudará mejor.",
    fr: "Cette consultation nécessite des conseils personnalisés. Je vais vous connecter avec un agent humain qui pourra mieux vous aider.",
    ht: "Konsiltasyon sa a bezwen konsèy pèsonalize. Mwen pral konekte ou ak yon ajant imen ki pral ede ou pi byen.",
    en: "This consultation requires personalized advice. I'll connect you with a human agent who can better assist you."
  };
  return messages[language] || messages['en'] || '';
}

function getLoginPromptMessage(language: string): string {
  const messages: Record<string, string> = {
    es: "Para continuar la conversación, por favor inicia sesión en tu cuenta.",
    fr: "Pour continuer la conversation, veuillez vous connecter à votre compte.",
    ht: "Pou kontinye konvèsasyon an, tanpri konekte ou nan kont ou.",
    en: "To continue the conversation, please log in to your account."
  };
  return messages[language] || messages['en'] || '';
}

function getLoginButtonText(language: string): string {
  const messages: Record<string, string> = {
    es: "Iniciar sesión",
    fr: "Se connecter",
    ht: "Konekte",
    en: "Log in"
  };
  return messages[language] || messages['en'] || '';
}

function getWaitingForAgentMessage(language: string): string {
  const messages: Record<string, string> = {
    es: "Buscando agente humano disponible... El agente también te contactará por WhatsApp.",
    fr: "Recherche d'un agent humain disponible... L'agent vous contactera également sur WhatsApp.",
    ht: "Chèche yon ajant imen ki disponib... Ajan an pral tou kontakte ou sou WhatsApp.",
    en: "Searching for available human agent... The agent will also contact you on WhatsApp."
  };
  return messages[language] || messages['en'] || '';
}

function getPaymentProofConfirmationMessage(language: string): string {
  const messages: Record<string, string> = {
    es: "✅ ¡Comprobante de pago recibido!\n\nHe escalado tu conversación a un asesor humano. Pronto un miembro de nuestro equipo se comunicará contigo.\n\nPuedes esperar aquí en el chat o el asesor te contactará por WhatsApp según tu preferencia.",
    fr: "✅ Reçu de paiement reçu!\n\nJ'ai escaladé votre conversation vers un conseiller humain. Bientôt, un membre de notre équipe vous contactera.\n\nVous pouvez attendre ici dans le chat ou le conseiller vous contactera par WhatsApp selon votre préférence.",
    ht: "✅ Resi peyman an resevwa!\n\nMwen te eskale konvèsasyon ou bay yon konsèyè imen. Byento, yon manm ekip nou a pral kontakte ou.\n\nOu ka tann isit la nan chat la oswa konsèyè a pral kontakte ou pa WhatsApp selon preferans ou.",
    en: "✅ Payment proof received!\n\nI have escalated your conversation to a human advisor. Soon, a team member will contact you.\n\nYou can wait here in the chat or the advisor will contact you via WhatsApp according to your preference."
  };
  return messages[language] || messages['en'] || '';
}

function getStaffTakeoverMessage(language: string, staffName?: string): string {
  const name = staffName || 'un asesor';
  const messages: Record<string, string> = {
    es: `👤 ${name} ha tomado tu conversación.\n\nAhora continuarás chateando directamente con el asesor humano. Lucie dejará de responder.\n\n💬 El agente también te contactará por WhatsApp.`,
    fr: `👤 ${name} a pris en charge votre conversation.\n\nVous continuerez maintenant à discuter directement avec le conseiller humain. Lucie arrêtera de répondre.\n\n💬 L'agent vous contactera également sur WhatsApp.`,
    ht: `👤 ${name} te pran konvèsasyon ou an.\n\nOu pral kontinye diskoute dirèkteman ak konsèyè imen an. Lucie pral sispann reponn.\n\n💬 Ajan an pral tou kontakte ou sou WhatsApp.`,
    en: `👤 ${name} has taken over your conversation.\n\nYou will now continue chatting directly with the human advisor. Lucie will stop responding.\n\n💬 The agent will also contact you on WhatsApp.`
  };
  return messages[language] || messages['en'] || '';
}

// Simple language detection based on common words
function detectLanguage(text: string, defaultLanguage: string): string {
  const lowerText = text.toLowerCase();

  // Spanish keywords
  const spanishKeywords = ['hola', 'buenos', 'gracias', 'por favor', 'quiero', 'necesito', 'tengo', 'español', 'visas', 'migración', 'ayuda', 'mañana', 'hoy', 'ayer'];
  // French keywords
  const frenchKeywords = ['bonjour', 'merci', 's\'il vous plaît', 'je veux', 'j\'ai besoin', 'français', 'visas', 'immigration', 'aide', 'demain', 'aujourd\'hui', 'hier'];
  // Haitian Creole keywords
  const creoleKeywords = ['bonjou', 'mèsi', 'tanpri', 'mwen vle', 'mwen bezwen', 'kreyòl', 'viza', 'imigrasyon', 'ede', 'demen', 'jodi', 'yè'];
  // English keywords
  const englishKeywords = ['hello', 'hi', 'thank you', 'please', 'i want', 'i need', 'english', 'visas', 'immigration', 'help', 'tomorrow', 'today', 'yesterday'];

  const spanishCount = spanishKeywords.filter(word => lowerText.includes(word)).length;
  const frenchCount = frenchKeywords.filter(word => lowerText.includes(word)).length;
  const creoleCount = creoleKeywords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishKeywords.filter(word => lowerText.includes(word)).length;

  // Find the language with the most matches
  const counts = { es: spanishCount, fr: frenchCount, ht: creoleCount, en: englishCount };
  const maxCount = Math.max(spanishCount, frenchCount, creoleCount, englishCount);

  if (maxCount === 0) {
    // Default to the provided language if no matches
    return defaultLanguage;
  }

  // Return the language with the most matches
  if (spanishCount === maxCount) return 'es';
  if (frenchCount === maxCount) return 'fr';
  if (creoleCount === maxCount) return 'ht';
  return 'en';
}

// Function to open Lucie chat from other components
export function openLucieChat() {
  window.dispatchEvent(new CustomEvent('openLucieChat'));
}
