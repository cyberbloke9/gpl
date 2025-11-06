import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import { toast } from "sonner";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Checklist from "./pages/Checklist";
import Transformer from "./pages/Transformer";
import Generator from "./pages/Generator";
import Issues from "./pages/Issues";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem("splashShown");
    if (splashShown) {
      setShowSplash(false);
    }

    // Check version and clear cache if needed
    const checkVersion = async () => {
      const { checkAppVersion, clearServiceWorkerCache, APP_VERSION } = await import('@/lib/sw-utils');
      
      const isCurrentVersion = checkAppVersion();
      if (!isCurrentVersion) {
        console.log('New version detected, clearing cache...');
        await clearServiceWorkerCache();
        toast.info(`Updated to version ${APP_VERSION}`, {
          description: 'Cache cleared for fresh content',
          action: {
            label: 'Reload',
            onClick: () => window.location.reload()
          },
          duration: 10000
        });
      }
    };
    
    checkVersion();

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('New version available!', {
                description: 'Refresh to get the latest updates.',
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload()
                },
                duration: Infinity
              });
            }
          });
        });
      });
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/checklist" element={<ProtectedRoute requireOperator><Checklist /></ProtectedRoute>} />
              <Route path="/transformer" element={<ProtectedRoute requireOperator><Transformer /></ProtectedRoute>} />
              <Route path="/generator" element={<ProtectedRoute requireOperator><Generator /></ProtectedRoute>} />
              <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
