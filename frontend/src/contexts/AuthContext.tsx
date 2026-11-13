import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type ApiUser } from '@/lib/api';

interface AuthContextType {
  user: ApiUser | null;
  session: { user: ApiUser } | null;
  loading: boolean;
  isAdmin: boolean;
  username: string | null;
  checkedAdmin: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setUsername: (username: string | null) => void;
}

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
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  async function refresh() {
    try {
      const me = await api.get<ApiUser>('/api/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setCheckedAdmin(true);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const res = await api.post<{ user: ApiUser }>('/api/auth/signup', { email, password, username });
      setUser(res.user);
      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    } finally {
      setCheckedAdmin(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{ user: ApiUser }>('/api/auth/login', { email, password });
      setUser(res.user);
      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    } finally {
      setCheckedAdmin(true);
    }
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
    setCheckedAdmin(true);
  };

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin: !!user?.isAdmin,
        username: user?.username ?? null,
        checkedAdmin,
        signUp,
        signIn,
        signOut,
        setUsername: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
