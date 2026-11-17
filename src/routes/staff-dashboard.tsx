import { useEffect, useState, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase/client";
import {
  getEscalatedConversations,
  getMyConversations,
  takeOverConversation,
  saveMessage,
  closeConversation,
  getConversationMessages,
  getConversationWithDetails,
  type ChatConversation,
  type ChatMessage
} from "@/lib/chat-service";
import { downloadIntakePDF } from "@/lib/pdf-generator";
import { Send, X, User, ArrowLeft, Download, FileText, Circle, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/staff-dashboard")({
  component: StaffDashboard,
});

// Helper function to get time ago in Uber style
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Ahora mismo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} días`;
  return date.toLocaleDateString();
}

function StaffDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"available" | "my" | "closed">("available" as "available" | "my" | "closed");
  const [conversationDetails, setConversationDetails] = useState<ChatConversation | null>(null);
  const [counts, setCounts] = useState<{ available: number; my: number; closed: number }>({ available: 0, my: 0, closed: 0 });
  const [userPresences, setUserPresences] = useState<Record<string, { full_name: string; is_online: boolean; phone?: string }>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user is staff or admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData && (userData.role === 'staff' || userData.role === 'admin')) {
        setUser({ ...user, role: userData.role });
      } else {
        // Redirect if not staff
        window.location.href = '/';
      }
    }
  };

  const loadConversations = useCallback(async () => {
    if (activeTab === "available") {
      const convs = await getEscalatedConversations();
      setConversations(convs);
    } else if (activeTab === "my") {
      const convs = await getMyConversations(user.id);
      setConversations(convs);
    } else if (activeTab === "closed") {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('status', 'closed')
        .order('updated_at', { ascending: false });

      if (!error) {
        setConversations(data || []);
      }
    }

    // Load counts for all tabs
    const [availableConvs, myConvs, closedConvs] = await Promise.all([
      getEscalatedConversations(),
      getMyConversations(user.id),
      supabase.from('chat_conversations').select('*').eq('status', 'closed')
    ]);

    setCounts({
      available: availableConvs.length,
      my: myConvs.length,
      closed: closedConvs.data?.length || 0
    });

    // Load user presence and names for all conversations
    const allConvs = [...availableConvs, ...myConvs, ...(closedConvs.data || [])];
    const userIds = [...new Set(allConvs.map(c => c.user_id).filter(Boolean))];

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, last_seen, phone')
        .in('id', userIds);

      if (usersData) {
        const presenceMap: Record<string, { full_name: string; is_online: boolean; phone?: string }> = {};
        for (const u of usersData) {
          const { data: isOnline } = await supabase.rpc('is_user_online', { user_id: u.id });
          presenceMap[u.id] = {
            full_name: u.full_name || 'Usuario',
            is_online: isOnline || false,
            phone: u.phone || undefined
          };
        }
        setUserPresences(presenceMap);
      }
    }

    // Also try to update anonymous conversations with user_id if we can match by session
    // This is a fallback - ideally the conversation should already have user_id when user logs in
    for (const conv of allConvs) {
      if (!conv.user_id && conv.session_id) {
        // Check if this session_id belongs to current user (staff can't see this info)
        // This is handled on the client side when user logs in
      }
    }
  }, [activeTab, user?.id]);

  const selectConversation = async (conv: ChatConversation) => {
    setSelectedConversation(conv);
    const msgs = await getConversationMessages(conv.id);
    setMessages(msgs);

    // Load conversation details (intake answers and payment proof)
    const details = await getConversationWithDetails(conv.id);
    setConversationDetails(details);
  };

  const handleTakeOver = async (conv: ChatConversation) => {
    await takeOverConversation(conv.id, user.id);
    await loadConversations();
    await selectConversation(conv);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const messageContent = input;
    setInput('');

    // Save to database (realtime will handle adding it to UI)
    await saveMessage(selectedConversation.id, 'staff', messageContent);

    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;
    await closeConversation(selectedConversation.id);
    await loadConversations();
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleCloseConversationDirect = async (conversationId: string) => {
    await closeConversation(conversationId);
    await loadConversations();
  };

  const handleDownloadClientPDF = () => {
    if (!conversationDetails || !conversationDetails.intake_answers) return;

    const pdfData = {
      answers: conversationDetails.intake_answers,
      language: selectedConversation?.language || 'es',
      conversationId: selectedConversation?.id || '',
      userId: selectedConversation?.user_id || undefined,
      date: new Date(selectedConversation?.created_at || '').toLocaleDateString()
    };

    downloadIntakePDF(pdfData);
  };

  const handleDownloadClientPDFDirect = (conv: ChatConversation) => {
    if (!conv.intake_answers) return;

    const pdfData = {
      answers: conv.intake_answers,
      language: conv.language || 'es',
      conversationId: conv.id,
      userId: conv.user_id || undefined,
      date: new Date(conv.created_at).toLocaleDateString()
    };

    downloadIntakePDF(pdfData);
  };

  const handleDownloadPaymentProof = () => {
    if (!conversationDetails?.payment_proof_url) return;
    window.open(conversationDetails.payment_proof_url, '_blank');
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user?.id, activeTab, loadConversations]);

  // Auto-focus input when conversation is selected or messages change
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation, messages]);

  // Real-time subscription for new messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const messageSubscription = supabase
      .channel(`staff_chat_messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          console.log('New message received in staff dashboard:', newMessage);
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(m => m.id === newMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [selectedConversation]);

  // Real-time subscription for new escalated conversations
  useEffect(() => {
    if (!user || activeTab !== 'available') return;

    const conversationSubscription = supabase
      .channel('staff_escalated_conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_conversations',
          filter: 'status=eq.escalated'
        },
        async () => {
          await loadConversations();
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
    };
  }, [user, activeTab, loadConversations]);

  // Real-time subscription for conversation status changes
  useEffect(() => {
    if (!user) return;

    const conversationSubscription = supabase
      .channel('staff_conversation_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations'
        },
        async () => {
          await loadConversations();
        }
      )
      .subscribe();

    // Real-time subscription for user presence changes
    const presenceSubscription = supabase
      .channel('staff_user_presence')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        async () => {
          // Reload conversations to get updated presence
          await loadConversations();
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [user, loadConversations]);

  if (!user) {
    return <div className="min-h-screen bg-deep flex items-center justify-center text-ivory">Cargando...</div>;
  }

  return (
    <div className="h-screen bg-deep text-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded border border-gold/30 px-3 py-2 text-gold2 hover:bg-gold/10 transition-colors"
            title="Volver a la página anterior"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gold2">Dashboard de Staff</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === "available"
                ? "bg-gold text-deep"
                : "bg-navy2 border border-gold/30 text-ivory"
            }`}
          >
            Conversaciones Disponibles
            {counts.available > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {counts.available}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === "my"
                ? "bg-gold text-deep"
                : "bg-navy2 border border-gold/30 text-ivory"
            }`}
          >
            Mis Conversaciones
            {counts.my > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {counts.my}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === "closed"
                ? "bg-gold text-deep"
                : "bg-navy2 border border-gold/30 text-ivory"
            }`}
          >
            Conversaciones Cerradas
            {counts.closed > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {counts.closed}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Conversations List - Uber Style */}
          <div className="bg-navy2 border border-gold/30 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold text-gold2 mb-4">
              {activeTab === "available" ? "📋 Pedidos Pendientes" :
               activeTab === "my" ? "📦 Mis Pedidos" :
               "✅ Pedidos Completados"}
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-deep">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    selectedConversation?.id === conv.id
                      ? "bg-gold/20 border-gold shadow-lg"
                      : "bg-deep border-gold/20 hover:border-gold/50 hover:shadow-md"
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                          <User size={24} className="text-gold" />
                        </div>
                        {conv.user_id && userPresences[conv.user_id]?.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-navy2" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gold2 text-lg">
                          {conv.user_id && userPresences[conv.user_id]
                            ? userPresences[conv.user_id].full_name
                            : "Usuario Anónimo"}
                        </p>
                        <p className="text-xs text-ivory/60">
                          Pedido #{conv.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ivory/60">
                        {getTimeAgo(conv.created_at)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        conv.status === 'escalated' ? 'bg-orange-500/20 text-orange-400' :
                        conv.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {conv.status === 'escalated' ? '⏳ Pendiente' :
                         conv.status === 'closed' ? '✓ Completado' :
                         '● En curso'}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-navy2/50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-ivory/60 text-xs">Idioma</p>
                        <p className="text-ivory font-medium">
                          {conv.language === 'es' ? '🇪🇸 Español' :
                           conv.language === 'fr' ? '🇫🇷 Français' :
                           conv.language === 'ht' ? '🇭🇹 Kreyòl' :
                           '🇬🇧 English'}
                        </p>
                      </div>
                      <div>
                        <p className="text-ivory/60 text-xs">Estado</p>
                        <p className="text-ivory font-medium">
                          {conv.user_id && userPresences[conv.user_id] ? (
                            userPresences[conv.user_id].is_online ? '🟢 En línea' : '⚪ Desconectado'
                          ) : '👤 Anónimo'}
                        </p>
                      </div>
                    </div>
                    {conv.user_id && userPresences[conv.user_id]?.phone ? (
                      <div className="mt-2 pt-2 border-t border-gold/10">
                        <p className="text-xs text-ivory/60 flex items-center gap-1">
                          📱 {userPresences[conv.user_id].phone}
                        </p>
                      </div>
                    ) : conv.user_id && (
                      <div className="mt-2 pt-2 border-t border-gold/10">
                        <p className="text-xs text-ivory/40 flex items-center gap-1">
                          ⚠️ Sin teléfono registrado
                        </p>
                      </div>
                    )}
                    {conv.payment_proof_url && (
                      <div className="mt-2 pt-2 border-t border-gold/10">
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          ✓ Comprobante de pago adjuntado
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {activeTab === "available" && conv.status === 'escalated' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeOver(conv);
                        }}
                        className="flex-1 bg-gradient-to-r from-gold to-gold/80 text-deep font-bold py-3 px-4 rounded-lg hover:from-gold/90 hover:to-gold/70 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      >
                        🚀 Aceptar Pedido
                      </button>
                      {conv.user_id && userPresences[conv.user_id]?.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const phone = userPresences[conv.user_id]?.phone;
                            const message = encodeURIComponent(`Hola, soy el agente de DIAGHU. Te escribo sobre tu pedido #${conv.id.slice(0, 8)}.`);
                            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                          }}
                          className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={18} />
                          WhatsApp
                        </button>
                      )}
                    </div>
                  )}
                  {activeTab === "my" && conv.status !== 'closed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectConversation(conv);
                        }}
                        className="flex-1 bg-gold text-deep font-bold py-2 px-4 rounded-lg hover:bg-gold/90 transition-colors"
                      >
                        💬 Ver Chat
                      </button>
                      {conv.user_id && userPresences[conv.user_id]?.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const phone = userPresences[conv.user_id]?.phone;
                            const message = encodeURIComponent(`Hola, soy el agente de DIAGHU. Te escribo sobre tu pedido #${conv.id.slice(0, 8)}.`);
                            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                          }}
                          className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={18} />
                          WhatsApp
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseConversationDirect(conv.id);
                        }}
                        className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ✓ Completar
                      </button>
                    </div>
                  )}
                  {activeTab === "closed" && (
                    <div className="flex gap-2">
                      {conv.intake_answers && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadClientPDFDirect(conv);
                          }}
                          className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          title="Descargar PDF Cliente"
                        >
                          <FileText size={16} />
                          PDF Cliente
                        </button>
                      )}
                      {conv.payment_proof_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(conv.payment_proof_url, '_blank');
                          }}
                          className="flex-1 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                          title="Descargar Comprobante"
                        >
                          <Download size={16} />
                          Comprobante
                        </button>
                      )}
                      {conv.user_id && userPresences[conv.user_id]?.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const phone = userPresences[conv.user_id]?.phone;
                            const message = encodeURIComponent(`Hola, soy el agente de DIAGHU. Te escribo sobre tu pedido #${conv.id.slice(0, 8)}.`);
                            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                          }}
                          className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={18} />
                          WhatsApp
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-ivory/50 text-lg">
                    {activeTab === "available" ? "No hay pedidos pendientes" :
                     activeTab === "my" ? "No tienes pedidos asignados" :
                     "No hay pedidos completados"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="bg-navy2 border border-gold/30 rounded-2xl p-4 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gold2">
                    Conversación #{selectedConversation.id.slice(0, 8)}
                  </h2>
                  <button
                    onClick={handleCloseConversation}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Download buttons for intake PDF and payment proof */}
                <div className="flex gap-2 mb-4">
                  {conversationDetails?.intake_answers && (
                    <button
                      onClick={handleDownloadClientPDF}
                      className="flex items-center gap-2 bg-navy2 border border-gold/30 px-3 py-2 rounded text-sm hover:bg-gold/10 transition-colors text-ivory"
                    >
                      <FileText size={16} />
                      <span>Descargar PDF Cliente</span>
                    </button>
                  )}
                  {conversationDetails?.payment_proof_url && (
                    <button
                      onClick={handleDownloadPaymentProof}
                      className="flex items-center gap-2 bg-navy2 border border-gold/30 px-3 py-2 rounded text-sm hover:bg-gold/10 transition-colors text-ivory"
                    >
                      <Download size={16} />
                      <span>Descargar Comprobante</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-deep">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gold text-deep'
                            : msg.role === 'staff'
                            ? 'bg-blue-600 text-white'
                            : 'bg-navy2/50 text-ivory border border-gold/20'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.role === 'user' ? 'Usuario' : msg.role === 'staff' ? 'Staff' : 'Lucie'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 bg-deep border border-gold/30 rounded-lg px-4 py-2 text-ivory placeholder:text-ivory/50 focus:outline-none focus:border-gold"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="bg-gold text-deep p-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-ivory/50">
                <p>Selecciona una conversación para ver los mensajes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
