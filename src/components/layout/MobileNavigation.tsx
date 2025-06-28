
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { navigationItems } from '@/lib/navigation';
import { hasPermission } from '@/lib/utils/permissions';
import { safeRoleCast } from '@/types/auth/base';

export const MobileNavigation: React.FC = () => {
  const { user } = useUser();

  if (!user) return null;

  const userRole = safeRoleCast(user.role);

  // Filter navigation items based on user permissions
  const allowedItems = navigationItems.filter(item => 
    hasPermission(userRole, item.permission)
  );

  // Only show the first 4 items on mobile
  const mobileItems = allowedItems.slice(0, 4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around py-2">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted-foreground transition-colors",
                isActive && "text-primary"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
