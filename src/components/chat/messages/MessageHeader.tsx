import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Hash, Lock, Users } from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';

interface MessageHeaderProps {
  title: string;
  subtitle: string;
  memberCount?: number;
  status?: 'online' | 'offline' | 'away';
  avatar?: string;
  isPrivate?: boolean;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({
  title,
  subtitle,
  memberCount,
  status,
  avatar,
  isPrivate
}) => {
  const isChannel = title.startsWith('#');

  return (
    <div className="border-b bg-background/50 p-4">
      <div className="flex items-center gap-3">
        {isChannel ? (
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Hash className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={title} />
              <AvatarFallback>
                {title.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {status && (
              <StatusIndicator 
                status={status} 
                className="absolute -bottom-1 -right-1 h-3 w-3 border-2 border-background"
              />
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{title}</h2>
            {isChannel && memberCount && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};