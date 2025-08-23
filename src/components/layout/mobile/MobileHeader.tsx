/**
 * Mobile-optimized header component
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { TouchTarget } from '@/components/ui/mobile/mobile-responsive';
import { useUser } from '@/services/state/app-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const user = useUser();
  
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      {/* Menu Button */}
      <TouchTarget as={Button} variant="ghost" size="md" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </TouchTarget>
      
      {/* App Title */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          Arivia Villas
        </h1>
      </div>
      
      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <TouchTarget as={Button} variant="ghost" size="md">
          <Bell className="h-5 w-5" />
        </TouchTarget>
        
        {user && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;