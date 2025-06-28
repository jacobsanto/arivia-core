
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { navigationItems } from '@/lib/navigation';
import { hasPermission } from '@/lib/utils/permissions';
import { safeRoleCast } from '@/types/auth/base';

export const Sidebar: React.FC = () => {
  const { user, logout } = useUser();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const userRole = safeRoleCast(user.role);

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navigationItems.map((item) => {
                if (!hasPermission(userRole, item.permission)) {
                  return null;
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
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
        </div>
        
        <div className="px-3">
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
  );
};
