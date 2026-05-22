/* eslint-disable */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '../supabaseClient';
import { isMockMode } from '../supabaseConfig';
import { isDevMockAuthEnabled } from '../utils/adminAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    data: { user: User | null; session: Session | null };
    error: any;
  }>;
  logout: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      const savedUser = sessionStorage.getItem('mock_user');
      const savedSession = sessionStorage.getItem('mock_session');
      if (savedUser && savedSession) {
        setUser(JSON.parse(savedUser));
        setSession(JSON.parse(savedSession));
      }
      setLoading(false);
    } else {
      let subscription: { unsubscribe: () => void } | undefined;

      void getSupabase()
        .then(async (supabase) => {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setLoading(false);
          });
          subscription = authSubscription;
        })
        .catch((err) => {
          console.error('Error getting session:', err);
          setLoading(false);
        });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        if (!isDevMockAuthEnabled) {
          return {
            data: { user: null, session: null },
            error: { message: 'Admin login is unavailable in production without Supabase.' },
          };
        }

        if (email === 'admin@blog.com' && password === 'password') {
          const mockUser = {
            id: 'mock-admin-uuid-1234',
            email: 'admin@blog.com',
            role: 'authenticated',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            factors: []
          } as unknown as User;

          const mockSession: Session = {
            access_token: 'mock-access-token-1234',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token-1234',
            user: mockUser,
            expires_at: Math.floor(Date.now() / 1000) + 3600
          };

          sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
          sessionStorage.setItem('mock_session', JSON.stringify(mockSession));
          setUser(mockUser);
          setSession(mockSession);
          return { data: { user: mockUser, session: mockSession }, error: null };
        } else {
          return {
            data: { user: null, session: null },
            error: { message: 'Invalid credentials.' },
          };
        }
      } else {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { data: { user: null, session: null }, error };
        }
        setUser(data.user);
        setSession(data.session);
        return { data, error: null };
      }
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        sessionStorage.removeItem('mock_user');
        sessionStorage.removeItem('mock_session');
        setUser(null);
        setSession(null);
        return { error: null };
      } else {
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signOut();
        if (!error) {
          setUser(null);
          setSession(null);
        }
        return { error };
      }
    } catch (err: any) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
