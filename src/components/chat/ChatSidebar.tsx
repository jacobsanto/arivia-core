import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatListItem } from '@/types/chat.types';
import { Hash, User, Circle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatSidebarProps {
  chatItems: ChatListItem[];
  activeItem: ChatListItem | null;
  onSelectItem: (item: ChatListItem) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatItems,
  activeItem,
  onSelectItem
}) => {
  const channels = chatItems.filter(item => item.type === 'channel');
  const directMessages = chatItems.filter(item => item.type === 'direct');

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const ChatItem: React.FC<{ item: ChatListItem }> = ({ item }) => {
    const isActive = activeItem?.id === item.id;
    
    return (
      <div
        className={`
          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
          hover:bg-accent/50
          ${isActive ? 'bg-primary/10 border border-primary/20' : ''}
        `}
        onClick={() => onSelectItem(item)}
      >
        <div className="flex-shrink-0">
          {item.type === 'channel' ? (
            <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
              <Hash className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              {item.isOnline && (
                <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-500 fill-current" />
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>
              {item.name}
            </h4>
            {item.lastMessage && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatMessageTime(item.lastMessage.createdAt)}
              </span>
            )}
          </div>
          
          {item.lastMessage && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {item.lastMessage.author.name}: {item.lastMessage.content}
            </p>
          )}
        </div>
        
        {item.unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1.5 rounded-full">
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Team Chat</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Channels */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Channels
            </h3>
            <div className="space-y-1">
              {channels.map(item => (
                <ChatItem key={item.id} item={item} />
              ))}
            </div>
          </div>
          
          {/* Direct Messages */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </h3>
            <div className="space-y-1">
              {directMessages.map(item => (
                <ChatItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};