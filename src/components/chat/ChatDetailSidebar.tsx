import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChatListItem, ChatChannel, DirectConversation, ChatMessage } from '@/types/chat.types';
import { Hash, User, Pin, Mail, Phone, Circle } from 'lucide-react';

interface ChatDetailSidebarProps {
  activeItem: ChatListItem | null;
  activeDetails: ChatChannel | DirectConversation | null;
}

export const ChatDetailSidebar: React.FC<ChatDetailSidebarProps> = ({
  activeItem,
  activeDetails
}) => {
  if (!activeItem || !activeDetails) {
    return null;
  }

  const isChannel = activeItem.type === 'channel';
  const channelDetails = isChannel ? activeDetails as ChatChannel : null;
  const conversationDetails = !isChannel ? activeDetails as DirectConversation : null;
  const otherUser = conversationDetails?.participants.find(p => p.id !== activeItem.id);

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            {isChannel ? (
              <div className="flex items-center justify-center w-12 h-12 rounded bg-muted">
                <Hash className="h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                {otherUser?.isOnline && (
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-current" />
                )}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{activeItem.name}</h3>
              {isChannel && channelDetails && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {channelDetails.members.length} members
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {channelDetails.type}
                  </Badge>
                </>
              )}
              {!isChannel && otherUser && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {otherUser.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {otherUser.isOnline ? 'Online' : `Last seen ${otherUser.lastSeen}`}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Channel Description/Topic */}
          {isChannel && channelDetails?.topic && (
            <div>
              <h4 className="text-sm font-medium mb-2">Topic</h4>
              <p className="text-sm text-muted-foreground">{channelDetails.topic}</p>
            </div>
          )}

          {/* Contact Info for Direct Messages */}
          {!isChannel && otherUser && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{otherUser.email}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call {otherUser.name}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Pinned Messages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-4 w-4" />
              <h4 className="text-sm font-medium">Pinned Messages</h4>
            </div>
            {(channelDetails?.pinnedMessages?.length || 0) > 0 ? (
              <div className="space-y-2">
                {channelDetails?.pinnedMessages.map((message: ChatMessage) => (
                  <div key={message.id} className="p-2 bg-muted/50 rounded text-sm">
                    <p className="font-medium">{message.author.name}</p>
                    <p className="text-muted-foreground line-clamp-2">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pinned messages</p>
            )}
          </div>

          {/* Channel Members */}
          {isChannel && channelDetails && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Members ({channelDetails.members.length})
                </h4>
                <div className="space-y-2">
                  {channelDetails.members.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="relative">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {member.isOnline && (
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-500 fill-current" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};