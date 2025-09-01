import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatListItem, ChatChannel, DirectConversation } from '@/types/chat.types';
import { Hash, User, Phone, Info, Circle } from 'lucide-react';

interface ChatHeaderProps {
  activeItem: ChatListItem | null;
  activeDetails: ChatChannel | DirectConversation | null;
  showDetailSidebar: boolean;
  onToggleDetailSidebar: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeItem,
  activeDetails,
  showDetailSidebar,
  onToggleDetailSidebar
}) => {
  if (!activeItem) {
    return (
      <div className="h-16 border-b bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    );
  }

  const isChannel = activeItem.type === 'channel';
  const channelDetails = isChannel ? activeDetails as ChatChannel : null;
  const conversationDetails = !isChannel ? activeDetails as DirectConversation : null;
  const otherUser = conversationDetails?.participants.find(p => p.id !== activeItem.id);

  return (
    <div className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isChannel ? (
            <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
              <Hash className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              {otherUser?.isOnline && (
                <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-500 fill-current" />
              )}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold text-base">{activeItem.name}</h3>
          {isChannel && channelDetails?.topic && (
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {channelDetails.topic}
            </p>
          )}
          {!isChannel && otherUser && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {otherUser.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {otherUser.isOnline ? 'Online' : `Last seen ${otherUser.lastSeen}`}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant={showDetailSidebar ? "default" : "ghost"}
          size="sm"
          onClick={onToggleDetailSidebar}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};