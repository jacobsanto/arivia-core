
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut, X } from 'lucide-react';
import { navigationItems } from '@/lib/navigation';
import { hasPermission } from '@/lib/utils/permissions';
import { safeRoleCast } from '@/types/auth/base';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useUser();

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const userRole = safeRoleCast(user.role);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-background border-r z-50 md:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <img 
            src="/arivia-logo-full-dark-bg.png" 
            alt="Arivia Villas" 
            className="h-8 w-auto"
          />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="py-4">
          <div className="space-y-1 px-3">
            <nav className="grid items-start text-sm font-medium">
              {navigationItems.map((item) => {
                if (!hasPermission(userRole, item.permission)) {
                  return null;
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          <div className="px-3 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
