import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Gauge, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-background pb-8">
      <Navigation />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Gayatri Power</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Daily Checklist & Monitoring System
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/checklist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <ClipboardCheck className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                <CardTitle className="text-base sm:text-lg lg:text-xl">Daily Checklist</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Complete your daily inspection checklist across 4 modules
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full text-xs sm:text-sm">Start Checklist</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/transformer">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <Gauge className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                <CardTitle className="text-base sm:text-lg lg:text-xl">Transformer Log</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Record hourly transformer readings and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full text-xs sm:text-sm">Log Readings</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/generator">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                <CardTitle className="text-base sm:text-lg lg:text-xl">Generator Log</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Record hourly generator readings and electrical parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button className="w-full text-xs sm:text-sm">Log Readings</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}