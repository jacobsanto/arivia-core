import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChannelList } from './ChannelList';
import { DirectMessageList } from './DirectMessageList';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateChannelDialog } from '../dialogs/CreateChannelDialog';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  unreadCount: number;
  isPrivate: boolean;
}

export interface DirectMessage {
  id: string;
  name: string;
  userId: string;
  avatar: string;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

interface ChatSidebarProps {
  channels: Channel[];
  directMessages: DirectMessage[];
  activeChat: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectChat: (chatId: string, chatName: string, type: 'channel' | 'direct') => void;
  onChannelCreated?: () => void;
  onClose?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  directMessages,
  activeChat,
  activeTab,
  onTabChange,
  onSelectChat,
  onChannelCreated,
  onClose
}) => {
  const isMobile = useIsMobile();
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false);

  const totalChannelUnread = channels.reduce((sum, channel) => sum + channel.unreadCount, 0);
  const totalDirectUnread = directMessages.reduce((sum, dm) => sum + dm.unreadCount, 0);

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>
          {isMobile && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-2">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Channels
            {totalChannelUnread > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                {totalChannelUnread}
              </Badge>
            )}
            {activeTab === 'channels' && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateChannelDialog(true);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Direct
            {totalDirectUnread > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                {totalDirectUnread}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="channels" className="h-full m-0 p-0">
            <ChannelList
              channels={channels}
              activeChat={activeChat}
              onSelectChat={(id, name) => onSelectChat(id, name, 'channel')}
            />
          </TabsContent>

          <TabsContent value="direct" className="h-full m-0 p-0">
            <DirectMessageList
              directMessages={directMessages}
              activeChat={activeChat}
              onSelectChat={(id, name) => onSelectChat(id, name, 'direct')}
            />
          </TabsContent>
        </div>
      </Tabs>

      <CreateChannelDialog
        isOpen={showCreateChannelDialog}
        onOpenChange={setShowCreateChannelDialog}
        onChannelCreated={() => {
          onChannelCreated?.();
          setShowCreateChannelDialog(false);
        }}
      />
    </div>
  );
};