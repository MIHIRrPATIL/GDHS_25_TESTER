import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Users, 
  MessageCircle, 
  Calendar,
  LogOut,
  Command
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: Users },
    { name: 'Chat', href: '/doctor/chat', icon: MessageCircle },
    { name: 'Patient Schedule', href: '/doctor/patient-schedule', icon: Calendar },
    { name: 'Doctor Schedule', href: '/doctor/doctor-schedule', icon: Calendar },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/doctor/dashboard' && location.pathname.startsWith(href));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="px-2 py-2">
              <div className="flex items-center justify-start w-full h-8 rounded-md p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2">
                <Stethoscope className="size-4 text-primary mr-2 flex-shrink-0 group-data-[collapsible=icon]:!size-6 group-data-[collapsible=icon]:mr-0" />
                <div className="group-data-[collapsible=icon]:hidden min-w-0">
                  <h1 className="text-sm font-medium text-foreground truncate">Medical Triage</h1>
                  <p className="text-xs text-muted-foreground truncate">Doctor Portal</p>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* User Info */}
            <div className="px-2 py-4 border-b border-border group-data-[collapsible=icon]:hidden">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link to={item.href}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

             {/* Sidebar Toggle */}
            <div className="px-2 py-2 mt-auto border-t border-border">
              <SidebarTrigger className="mb-2" />

              {/* Command Palette Trigger */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-sm justify-start rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:!size-6"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                    bubbles: true
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Command />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Quick Search</span>
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded group-data-[collapsible=icon]:hidden">⌘K</span>
              </Button>
            </div>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-2 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full h-8 text-sm justify-start rounded-md p-2 text-destructive hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:!size-6"
              >
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1">
          <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center px-4 py-2">
              <SidebarTrigger />
            </div>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};