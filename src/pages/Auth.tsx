import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { toast } from 'sonner';

// Validation schemas
const signUpSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must be less than 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Employee ID can only contain letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Auth() {
  const { signIn, signUp, signInWithGoogle, user, checkLockoutStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ isLockedOut: boolean; timeRemaining: number }>({ 
    isLockedOut: false, 
    timeRemaining: 0 
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = signInSchema.parse({
        email: signInEmail,
        password: signInPassword
      });

      // Check lockout status for this specific email
      const status = checkLockoutStatus(validatedData.email);
      if (status.isLockedOut) {
        setLockoutInfo(status);
        const minutes = Math.floor(status.timeRemaining / 60);
        const seconds = status.timeRemaining % 60;
        const timeMessage = minutes > 0 
          ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
          : `${seconds} second${seconds !== 1 ? 's' : ''}`;
        toast.error(`This account is locked. Try again in ${timeMessage}.`);
        return;
      }

      setLoading(true);
      const { error } = await signIn(validatedData.email, validatedData.password);
      if (error && error.message !== 'Rate limited') {
        toast.error(error.message || 'Failed to sign in');
      } else if (!error) {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = signUpSchema.parse({
        fullName,
        employeeId: employeeId || undefined,
        email: signUpEmail,
        password: signUpPassword
      });

      setLoading(true);
      const { error } = await signUp(
        validatedData.email,
        validatedData.password,
        validatedData.fullName,
        validatedData.employeeId
      );
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Google Sign-In error:', error);
      setGoogleLoading(false);
    }
    // Don't set loading to false on success as user will be redirected
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Gayatri Power</CardTitle>
          <CardDescription className="text-center">
            Daily Checklist & Monitoring System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 h-11 bg-background hover:bg-accent"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                {lockoutInfo.isLockedOut && (
                  <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
                    Account locked. Try again in {Math.floor(lockoutInfo.timeRemaining / 60)}m {lockoutInfo.timeRemaining % 60}s
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading || lockoutInfo.isLockedOut}>
                  {loading ? 'Signing in...' : lockoutInfo.isLockedOut ? 'Account Locked' : 'Sign In'}
                </Button>
              </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 h-11 bg-background hover:bg-accent"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {googleLoading ? 'Signing up...' : 'Continue with Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Letters and spaces only, 2-100 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-employee">Employee ID (Optional)</Label>
                  <Input
                    id="signup-employee"
                    type="text"
                    placeholder="EMP-001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Letters, numbers, and hyphens only, 3-20 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    minLength={8}
                    maxLength={72}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
