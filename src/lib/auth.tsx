import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

type UserRole = 'admin' | 'staff' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

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
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
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
        role: 'client', // Default role
      });

      if (dbError) {
        console.error('Error creating user record:', dbError);
        return { error: dbError as AuthError };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        refreshRole,
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
