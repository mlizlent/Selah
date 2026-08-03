import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, setSessionCookie, getSessionCookie } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  username: string | null;
  checkedAdmin: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUsername: (username: string | null) => void;
}

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL_SHIELD || '').trim().toLowerCase();
const ADMIN_USERNAME = 'RoyalDiadem';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  username: null,
  checkedAdmin: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  setUsername: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  async function checkAdminStatus(accessToken: string) {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('[auth] /api/auth/me status:', res.status, 'ok:', res.ok);
      if (res.ok) {
        const data = await res.json();
        console.log('[auth] /api/auth/me data:', data);
        setIsAdmin(data.isAdmin);
        if (data.username) {
          setUsername(data.username);
        }
      } else {
        const text = await res.text();
        console.log('[auth] /api/auth/me error body:', text);
      }
    } catch (err) {
      console.log('[auth] /api/auth/me fetch error:', err);
    } finally {
      setCheckedAdmin(true);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUsername(session?.user?.user_metadata?.username || null);
      setLoading(false);
      if (session) {
        setSessionCookie(session);
        checkAdminStatus(session.access_token);
      } else {
        setSessionCookie(null);
        setCheckedAdmin(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUsername(session?.user?.user_metadata?.username || null);
      setLoading(false);
      if (session) {
        setSessionCookie(session);
        setCheckedAdmin(false);
        checkAdminStatus(session.access_token);
      } else {
        setSessionCookie(null);
        setIsAdmin(false);
        setCheckedAdmin(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUsername(null);
    setCheckedAdmin(false);
    setSessionCookie(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, username, checkedAdmin, signUp, signIn, signOut, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
