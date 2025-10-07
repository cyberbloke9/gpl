import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  Gauge, 
  LayoutDashboard, 
  LogOut,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navigation = () => {
  const { user, signOut, userRole } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              Gayatri Power
            </Link>
            {user && (
              <div className="flex gap-2">
                <Link to="/checklist">
                  <Button variant={isActive('/checklist') ? 'default' : 'ghost'} size="sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Checklist
                  </Button>
                </Link>
                <Link to="/transformer">
                  <Button variant={isActive('/transformer') ? 'default' : 'ghost'} size="sm">
                    <Gauge className="mr-2 h-4 w-4" />
                    Transformer Log
                  </Button>
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin">
                    <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Role: {userRole}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
