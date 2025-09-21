import { Outlet, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Pill,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const PatientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: Heart },
    { name: 'Profile', href: '/patient/profile', icon: Settings },
    { name: 'Messages', href: '/patient/messages', icon: MessageCircle },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16 min-w-0">
            {/* Logo */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3 flex-shrink-0" />
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Health Portal</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Patient Dashboard</p>
              </div>
              <div className="sm:hidden min-w-0">
                <h1 className="text-base font-semibold text-foreground truncate">Health Portal</h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8 flex-shrink-0">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-2 lg:px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1 lg:mr-2 flex-shrink-0" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="hidden lg:block min-w-0 max-w-32">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Patient'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'patient@example.com'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-destructive hover:text-destructive p-1 sm:p-2 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:ml-2 xl:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border">
          <nav className="flex overflow-x-auto py-1 px-3 space-x-2 sm:space-x-4 scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center py-2 px-2 sm:px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 min-w-0",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4 mb-1 flex-shrink-0" />
                  <span className="truncate max-w-16 sm:max-w-20">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};