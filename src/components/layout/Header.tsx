
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { Bell, Menu } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useUser();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <img 
              src="/arivia-logo-full-dark-bg.png" 
              alt="Arivia Villas" 
              className="h-8 w-auto"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          {isMobile ? (
            <MobileNav user={user} onSignOut={handleSignOut} />
          ) : (
            <UserNav user={user} onSignOut={handleSignOut} />
          )}
        </div>
      </div>
    </header>
  );
};
