/**
 * Mobile sidebar with slide-out animation and touch-optimized navigation
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, CheckSquare, Package, Users, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TouchTarget } from '@/components/ui/mobile/mobile-responsive';
import { useUser } from '@/services/state/app-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const user = useUser();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/tasks/enhanced', icon: CheckSquare, label: 'Tasks' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];
  
  // Add admin items
  if (user?.role === 'administrator' || user?.role === 'superadmin') {
    navItems.push(
      { to: '/admin/users', icon: Users, label: 'User Management' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' }
    );
  }
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-card border-r border-border z-50',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <TouchTarget as={Button} variant="ghost" size="md" onClick={onClose}>
            <X className="h-5 w-5" />
          </TouchTarget>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                    'min-h-[48px]', // Touch-friendly height
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
};

export default MobileSidebar;