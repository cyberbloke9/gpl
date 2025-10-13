import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Gauge, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [userRole, navigate]);

  // Only render for operators
  if (userRole === 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Gayatri Power</h1>
          <p className="text-muted-foreground mt-2">
            Daily Checklist & Monitoring System
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <Link to="/checklist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-3">
                <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Daily Checklist</CardTitle>
                <CardDescription className="text-sm">
                  Complete your daily inspection checklist across 4 modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Checklist</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/transformer">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-3">
                <Gauge className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Transformer Log</CardTitle>
                <CardDescription className="text-sm">
                  Record hourly transformer readings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Log Readings</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}