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
  checkLockoutStatus: (email: string) => { isLockedOut: boolean; timeRemaining: number };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Helper functions for email-based rate limiting
  const getLoginAttempts = (email: string) => {
    try {
      const key = `login_attempts_${btoa(email)}`;
      const data = localStorage.getItem(key);
      if (!data) return { attempts: 0, lockoutUntil: null };
      
      const parsed = JSON.parse(data);
      // Clean up if lockout has expired
      if (parsed.lockoutUntil && new Date(parsed.lockoutUntil) < new Date()) {
        localStorage.removeItem(key);
        return { attempts: 0, lockoutUntil: null };
      }
      return parsed;
    } catch {
      return { attempts: 0, lockoutUntil: null };
    }
  };

  const setLoginAttempts = (email: string, data: { attempts: number; lockoutUntil: string | null }) => {
    try {
      const key = `login_attempts_${btoa(email)}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store login attempts:', error);
    }
  };

  const checkLockoutStatus = (email: string) => {
    const data = getLoginAttempts(email);
    if (!data.lockoutUntil) {
      return { isLockedOut: false, timeRemaining: 0 };
    }

    const lockoutDate = new Date(data.lockoutUntil);
    const now = new Date();
    
    if (now >= lockoutDate) {
      // Lockout expired, clean up
      setLoginAttempts(email, { attempts: 0, lockoutUntil: null });
      return { isLockedOut: false, timeRemaining: 0 };
    }

    const remaining = Math.ceil((lockoutDate.getTime() - now.getTime()) / 1000);
    return { isLockedOut: true, timeRemaining: remaining };
  };

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
    // Check if this specific email is locked out
    const lockoutStatus = checkLockoutStatus(email);
    
    if (lockoutStatus.isLockedOut) {
      const remaining = lockoutStatus.timeRemaining;
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const timeMessage = minutes > 0 
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
        : `${seconds} second${seconds !== 1 ? 's' : ''}`;
      
      toast.error(`Too many failed attempts for this account. Try again in ${timeMessage}.`);
      return { error: new Error('Rate limited') };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Get current attempts for this email
      const data = getLoginAttempts(email);
      const newAttempts = data.attempts + 1;
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
        setLoginAttempts(email, { attempts: newAttempts, lockoutUntil });
        toast.error('Too many failed attempts. This account is locked for 15 minutes.');
      } else {
        setLoginAttempts(email, { attempts: newAttempts, lockoutUntil: null });
        const remainingAttempts = 5 - newAttempts;
        toast.error(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining for this account.`);
      }
    } else {
      // Reset attempts on successful login for this email
      setLoginAttempts(email, { attempts: 0, lockoutUntil: null });
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
    <AuthContext.Provider value={{ user, session, loading, roleLoading, signIn, signUp, signOut, userRole, checkLockoutStatus }}>
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
