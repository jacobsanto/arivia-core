import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ChatListItem, ChatChannel, DirectConversation } from '@/types/chat.types';
import { Hash, User, Phone, Info, Circle, Search, Settings, UserPlus, Bell, BellOff, MoreVertical } from 'lucide-react';

interface EnhancedChatHeaderProps {
  activeItem: ChatListItem | null;
  activeDetails: ChatChannel | DirectConversation | null;
  showDetailSidebar: boolean;
  onToggleDetailSidebar: () => void;
  onSearchMessages?: (query: string) => void;
  onStartCall?: () => void;
  onToggleNotifications?: () => void;
  isNotificationEnabled?: boolean;
}

export const EnhancedChatHeader: React.FC<EnhancedChatHeaderProps> = ({
  activeItem,
  activeDetails,
  showDetailSidebar,
  onToggleDetailSidebar,
  onSearchMessages,
  onStartCall,
  onToggleNotifications,
  isNotificationEnabled = true
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeItem) {
    return (
      <div className="h-16 border-b bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1">Welcome to Team Chat</h3>
          <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const isChannel = activeItem.type === 'channel';
  const channelDetails = isChannel ? activeDetails as ChatChannel : null;
  const conversationDetails = !isChannel ? activeDetails as DirectConversation : null;
  const otherUser = conversationDetails?.participants.find(p => p.id !== activeItem.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchMessages) {
      onSearchMessages(searchQuery);
    }
  };

  const memberCount = isChannel ? channelDetails?.members.length || 0 : 2;

  return (
    <div className="border-b bg-background">
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isChannel ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Hash className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {otherUser?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background">
                    <Circle className="w-full h-full text-green-500 fill-current" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{activeItem.name}</h3>
              {isChannel && (
                <Badge variant="outline" className="text-xs">
                  {memberCount} members
                </Badge>
              )}
            </div>
            
            {isChannel && channelDetails?.topic && (
              <p className="text-sm text-muted-foreground truncate">
                {channelDetails.topic}
              </p>
            )}
            
            {!isChannel && otherUser && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {otherUser.role}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {otherUser.isOnline ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </span>
                  ) : (
                    `Last seen ${otherUser.lastSeen}`
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? "bg-primary/10 text-primary" : ""}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Call Button */}
          <Button variant="ghost" size="sm" onClick={onStartCall}>
            <Phone className="h-4 w-4" />
          </Button>

          {/* Notifications Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleNotifications}
            className={!isNotificationEnabled ? "text-muted-foreground" : ""}
          >
            {isNotificationEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isChannel && (
                <>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Channel settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Search className="h-4 w-4 mr-2" />
                Search in conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Detail Sidebar Toggle */}
          <Button
            variant={showDetailSidebar ? "default" : "ghost"}
            size="sm"
            onClick={onToggleDetailSidebar}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 border-t bg-muted/30">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};