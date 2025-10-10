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

        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/checklist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <ClipboardCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Daily Checklist</CardTitle>
                <CardDescription>
                  Complete your daily inspection checklist across 4 modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Checklist</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/transformer">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Gauge className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Transformer Log</CardTitle>
                <CardDescription>
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