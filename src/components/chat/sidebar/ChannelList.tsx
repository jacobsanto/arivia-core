import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Channel } from './ChatSidebar';

interface ChannelListProps {
  channels: Channel[];
  activeChat: string;
  onSelectChat: (id: string, name: string) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChat,
  onSelectChat
}) => {
  if (channels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No channels available</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto p-3 text-left",
              activeChat === channel.name && "bg-accent text-accent-foreground"
            )}
            onClick={() => onSelectChat(channel.id, channel.name)}
          >
            <div className="flex items-center gap-3 min-w-0 w-full">
              <div className="flex-shrink-0">
                {channel.isPrivate ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">
                    {channel.name}
                  </span>
                  {channel.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </div>
                
                {channel.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {channel.description}
                  </p>
                )}
                
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{channel.memberCount}</span>
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};