import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, Zap } from 'lucide-react';

interface UserStatusIndicatorProps {
  isOnline: boolean;
  lastSeen?: string;
  role?: string;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  isOnline,
  lastSeen,
  role,
  showRole = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return '';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Indicator */}
      <div className="relative flex items-center">
        {isOnline ? (
          <div className="flex items-center gap-1">
            <div className={`${sizeClasses[size]} bg-green-500 rounded-full`}>
              <Circle className="w-full h-full text-green-500 fill-current" />
            </div>
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className={`${sizeClasses[size]} bg-gray-400 rounded-full`}>
              <Circle className="w-full h-full text-gray-400 fill-current" />
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatLastSeen(lastSeen)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {showRole && role && (
        <Badge variant="outline" className="text-xs flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {role}
        </Badge>
      )}
    </div>
  );
};