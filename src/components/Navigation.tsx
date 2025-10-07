import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  Gauge, 
  LayoutDashboard, 
  LogOut,
  User,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navigation = () => {
  const { user, signOut, userRole } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col gap-2 mt-8" : "flex gap-2"}>
      {userRole === 'admin' ? (
        // Admin sees Admin Dashboard and Issues
        <>
          <Link to="/admin" onClick={() => mobile && setIsOpen(false)}>
            <Button 
              variant={isActive('/admin') ? 'default' : 'ghost'} 
              size="sm"
              className={mobile ? "w-full justify-start" : ""}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/issues" onClick={() => mobile && setIsOpen(false)}>
            <Button 
              variant={isActive('/issues') ? 'default' : 'ghost'} 
              size="sm"
              className={mobile ? "w-full justify-start" : ""}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Issues
            </Button>
          </Link>
        </>
      ) : (
        // Operators see all operational links
        <>
          <Link to="/checklist" onClick={() => mobile && setIsOpen(false)}>
            <Button 
              variant={isActive('/checklist') ? 'default' : 'ghost'} 
              size="sm"
              className={mobile ? "w-full justify-start" : ""}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Checklist
            </Button>
          </Link>
          <Link to="/transformer" onClick={() => mobile && setIsOpen(false)}>
            <Button 
              variant={isActive('/transformer') ? 'default' : 'ghost'} 
              size="sm"
              className={mobile ? "w-full justify-start" : ""}
            >
              <Gauge className="mr-2 h-4 w-4" />
              Transformer
            </Button>
          </Link>
          <Link to="/issues" onClick={() => mobile && setIsOpen(false)}>
            <Button 
              variant={isActive('/issues') ? 'default' : 'ghost'} 
              size="sm"
              className={mobile ? "w-full justify-start" : ""}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Issues
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-base sm:text-xl font-bold truncate">
              Gayatri Power
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex">
              <NavLinks />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background z-[100]">
                  <DropdownMenuLabel className="truncate max-w-[200px]">{user.email}</DropdownMenuLabel>
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
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-6">
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Role: {userRole}</p>
                  </div>
                  
                  <NavLinks mobile />
                  
                  <Button 
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
