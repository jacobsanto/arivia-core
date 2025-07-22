import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  isOnline?: boolean;
  memberCount?: number;
  onSearchClick?: () => void;
  onCallClick?: () => void;
  onVideoCallClick?: () => void;
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatar,
  isOnline,
  memberCount,
  onSearchClick,
  onCallClick,
  onVideoCallClick,
  onMenuClick,
  onToggleSidebar,
  className
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={title} />
            <AvatarFallback>
              {title.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground truncate">{title}</h2>
            {memberCount && (
              <Badge variant="secondary" className="text-xs">
                {memberCount} members
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onSearchClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        {onCallClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCallClick}
            className="h-8 w-8 p-0 hidden sm:flex"
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        
        {onVideoCallClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCallClick}
            className="h-8 w-8 p-0 hidden sm:flex"
          >
            <Video className="h-4 w-4" />
          </Button>
        )}
        
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};