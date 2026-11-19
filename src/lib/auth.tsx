import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import { hasActiveConversation as checkActiveConversationFn } from '@/lib/chat-service';

// Check if Supabase is configured
const isSupabaseConfigured = !!import.meta.env['VITE_SUPABASE_URL'] && !!import.meta.env['VITE_SUPABASE_ANON_KEY'];

type UserRole = 'admin' | 'staff' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  needsPhoneUpdate: boolean;
  hasActiveConversation: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: AuthError | null }>;
  signOut: (isAutoLogout?: boolean) => Promise<void>;
  refreshRole: () => Promise<void>;
  updatePresence: () => Promise<void>;
  updateUserPhone: (phone: string) => Promise<{ error: AuthError | null }>;
  checkActiveConversation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPhoneUpdate, setNeedsPhoneUpdate] = useState(false);
  const [hasActiveConversation, setHasActiveConversation] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const updatePresenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-logout after 1 hour of inactivity
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        setLastActivity(Date.now());
        checkActiveConversation();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        setLastActivity(Date.now());
        checkActiveConversation();
        if (event === 'SIGNED_IN') {
          setJustLoggedIn(true);
          // Clear chat session ID to start fresh conversation for new user
          localStorage.removeItem('lucie_session_id');
          // Update presence on login
          updatePresence();
        }
      } else {
        setRole(null);
        setLoading(false);
        setHasActiveConversation(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor user activity and auto-logout
  useEffect(() => {
    if (!user) return;

    const resetActivityTimer = () => {
      setLastActivity(Date.now());
      updatePresence(); // Update presence on activity
    };

    // Track user activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });

    // Update presence every 2 minutes
    const presenceUpdate = setInterval(() => {
      updatePresence();
    }, 2 * 60 * 1000);

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('User inactive for 1 hour, signing out...');
        signOut(true);
      }
    }, 60 * 1000); // Check every minute

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
      clearInterval(presenceUpdate);
      clearInterval(inactivityCheck);
    };
  }, [user, lastActivity]);

  // Redirect based on role after login
  useEffect(() => {
    if (justLoggedIn && role && !loading) {
      setJustLoggedIn(false);
      if (role === 'staff') {
        window.location.href = '/staff-dashboard';
      } else if (role === 'admin') {
        window.location.href = '/admin';
      }
    }
  }, [justLoggedIn, role, loading]);

  const fetchUserRole = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    console.log('=== Fetching User Role ===');
    console.log('User ID from auth:', userId);

    try {
      // Use RPC function that bypasses RLS
      const { data, error } = await supabase.rpc('get_user_role', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching user role via RPC:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        setRole('client'); // Default to client if error
      } else {
        console.log('User role fetched via RPC:', data);
        setRole(data || 'client');
      }

      // Check if user has phone number
      const { data: userData } = await supabase
        .from('users')
        .select('phone')
        .eq('id', userId)
        .single();

      if (userData && !userData.phone) {
        setNeedsPhoneUpdate(true);
      } else {
        setNeedsPhoneUpdate(false);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('client'); // Default to client if error
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Only log to console in development mode
    if (error && import.meta.env.DEV) {
      console.debug('Auth error:', error.message);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    // Create user record in users table with client role
    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: data.user.id,
        email: email,
        password_hash: '', // Auth handles password
        full_name: fullName,
        phone: phone,
        role: 'client', // Default role
      });

      if (dbError) {
        console.error('Error creating user record:', dbError);
        return { error: { message: dbError.message } as unknown as AuthError };
      }
    }

    return { error: null };
  };

  const signOut = async (isAutoLogout = false) => {
    if (isAutoLogout) {
      sessionStorage.setItem('autoLoggedOut', 'true');
    }
    // Clear chat session ID on sign out
    localStorage.removeItem('lucie_session_id');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setRole(null);
  };

  const refreshRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const updatePresence = async () => {
    if (!user) return;

    // Clear any pending update
    if (updatePresenceTimeoutRef.current) {
      clearTimeout(updatePresenceTimeoutRef.current);
    }

    // Debounce the update to avoid multiple simultaneous calls
    updatePresenceTimeoutRef.current = setTimeout(async () => {
      try {
        await supabase.rpc('update_user_presence', { user_id: user.id });
      } catch (error) {
        // Silently ignore presence update errors to not disrupt user experience
        console.debug('Presence update skipped:', error);
      }
    }, 1000); // Wait 1 second before updating
  };

  const updateUserPhone = async (phone: string) => {
    if (!user) return { error: { message: 'No user logged in' } as AuthError };

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return { error: { message: 'Invalid phone format' } as AuthError };
    }

    const { error } = await supabase
      .from('users')
      .update({ phone })
      .eq('id', user.id);

    if (error) {
      return { error };
    }

    setNeedsPhoneUpdate(false);
    return { error: null };
  };

  const checkActiveConversation = async () => {
    const hasActive = await checkActiveConversationFn();
    setHasActiveConversation(hasActive);
  };

  // Real-time subscription to update hasActiveConversation when conversation status changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('user_conversation_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const updatedConv = payload.new as any;
          // Update hasActiveConversation based on new status
          const isActive = updatedConv.status === 'active' || updatedConv.status === 'escalated';
          setHasActiveConversation(isActive);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        needsPhoneUpdate,
        hasActiveConversation,
        signIn,
        signUp,
        signOut,
        refreshRole,
        updatePresence,
        updateUserPhone,
        checkActiveConversation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
