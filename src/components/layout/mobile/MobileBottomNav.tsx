/**
 * Mobile bottom navigation - optimized for touch interaction
 */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Package, 
  Users, 
  BarChart3,
  Menu
} from 'lucide-react';
import { TouchTarget } from '@/components/ui/mobile/mobile-responsive';
import { useUser } from '@/services/state/app-state';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const user = useUser();
  const location = useLocation();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/tasks/enhanced', icon: CheckSquare, label: 'Tasks' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/analytics', icon: BarChart3, label: 'Reports' },
  ];
  
  // Add admin-specific items
  if (user?.role === 'administrator' || user?.role === 'superadmin') {
    navItems.push({ to: '/admin/users', icon: Users, label: 'Users' });
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                'text-xs font-medium',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Menu Button */}
        <TouchTarget
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
          onClick={onOpenMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs font-medium">More</span>
        </TouchTarget>
      </div>
    </nav>
  );
};

export default MobileBottomNav;