import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, employeeId?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  isLockedOut: boolean;
  lockoutTimeRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Update lockout timer every second
  useEffect(() => {
    if (!lockoutUntil) {
      setIsLockedOut(false);
      setLockoutTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setIsLockedOut(false);
        setLockoutTimeRemaining(0);
      } else {
        setIsLockedOut(true);
        setLockoutTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

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
    setRoleLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setUserRole(data.role);
    }
    setRoleLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    // Check if account is locked out
    if (lockoutUntil && new Date() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const timeMessage = minutes > 0 
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
        : `${seconds} second${seconds !== 1 ? 's' : ''}`;
      
      toast.error(`Too many failed attempts. Try again in ${timeMessage}.`);
      return { error: new Error('Rate limited') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockout = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        setLockoutUntil(lockout);
        toast.error('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        const remainingAttempts = 5 - newAttempts;
        toast.error(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
      }
    } else {
      // Reset on successful login
      setFailedAttempts(0);
      setLockoutUntil(null);
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
        if (error.message.includes('timeout')) {
          toast.error('Server is taking too long to respond. Please try again.');
        } else if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(`Failed to create account: ${error.message}`);
        }
        return { error };
      }

      toast.success('Account created successfully!');
      return { error: null };
    } catch (err: any) {
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
    <AuthContext.Provider value={{ user, session, loading, roleLoading, signIn, signUp, signOut, userRole, isLockedOut, lockoutTimeRemaining }}>
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
