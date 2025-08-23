import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DirectMessage } from './ChatSidebar';
import { StatusIndicator } from '../ui/StatusIndicator';

interface DirectMessageListProps {
  directMessages: DirectMessage[];
  activeChat: string;
  onSelectChat: (id: string, name: string) => void;
}

export const DirectMessageList: React.FC<DirectMessageListProps> = ({
  directMessages,
  activeChat,
  onSelectChat
}) => {
  if (directMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Avatar className="h-12 w-12 mx-auto mb-2 opacity-50">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <p className="text-sm">No direct messages</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {directMessages.map((dm) => (
          <Button
            key={dm.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto p-3 text-left",
              activeChat === dm.name && "bg-accent text-accent-foreground"
            )}
            onClick={() => onSelectChat(dm.id, dm.name)}
          >
            <div className="flex items-center gap-3 min-w-0 w-full">
              <div className="relative flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={dm.avatar} alt={dm.name} />
                  <AvatarFallback>
                    {dm.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <StatusIndicator 
                  status={dm.status} 
                  className="absolute -bottom-1 -right-1 h-3 w-3 border-2 border-background"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">
                    {dm.name}
                  </span>
                  {dm.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                      {dm.unreadCount}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="capitalize">{dm.status}</span>
                  {dm.lastSeen && dm.status === 'offline' && (
                    <span>• Last seen {dm.lastSeen.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};