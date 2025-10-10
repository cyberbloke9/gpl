import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, employeeId?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setUserRole(data.role);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      toast.success('Signed in successfully!');
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, employeeId?: string) => {
    try {
      if (!fullName || fullName.trim().length === 0) {
        const error = new Error('Full name is required');
        toast.error('Please provide your full name');
        return { error };
      }

      if (import.meta.env.DEV) {
        console.log('Attempting signup for:', email);
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            employee_id: employeeId?.trim() || null
          }
        }
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Signup error:', error);
        }
        if (error.message.includes('timeout')) {
          toast.error('Server is taking too long to respond. Please try again.');
        } else if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(`Failed to create account: ${error.message}`);
        }
        return { error };
      }

    if (import.meta.env.DEV) {
      console.log('Signup successful');
    }
      toast.success('Account created successfully!');
      return { error: null };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Unexpected signup error:', err);
      }
      toast.error('An unexpected error occurred. Please try again.');
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    toast.success('Signed out successfully!');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, userRole }}>
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
