import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Auth() {
  const { signIn, user, checkLockoutStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

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
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
          
          <p className="text-sm text-muted-foreground text-center mt-6">
            Need an account? Contact your administrator for access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
