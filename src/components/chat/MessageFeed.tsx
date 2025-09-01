import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage, TypingIndicator } from '@/types/chat.types';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Reply, MoreHorizontal, User } from 'lucide-react';

interface MessageFeedProps {
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  currentUserId?: string;
  onReply: (message: ChatMessage) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  typingUsers,
  currentUserId,
  onReply,
  onAddReaction
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || !isSameDay(new Date(lastGroup.date), messageDate)) {
        groups.push({
          date: message.createdAt,
          messages: [message]
        });
      } else {
        lastGroup.messages.push(message);
      }
    });
    
    return groups;
  };

  const shouldShowAvatar = (message: ChatMessage, previousMessage?: ChatMessage) => {
    if (!previousMessage) return true;
    if (previousMessage.authorId !== message.authorId) return true;
    
    const timeDiff = new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const MessageBubble: React.FC<{ 
    message: ChatMessage; 
    showAvatar: boolean; 
    isOwn: boolean;
  }> = ({ message, showAvatar, isOwn }) => {
    const reactionCounts = message.reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0 w-8">
          {showAvatar && !isOwn && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        
        <div className={`flex-1 max-w-lg ${isOwn ? 'flex flex-col items-end' : ''}`}>
          {showAvatar && !isOwn && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{message.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.createdAt), 'HH:mm')}
              </span>
            </div>
          )}
          
          {message.replyTo && (
            <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary/30 text-sm">
              <span className="font-medium text-muted-foreground">
                Replying to {message.replyTo.author.name}
              </span>
              <p className="text-muted-foreground truncate">
                {message.replyTo.content}
              </p>
            </div>
          )}
          
          <div className={`
            p-3 rounded-lg max-w-full break-words
            ${isOwn 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
            }
          `}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {isOwn && (
              <div className="text-xs opacity-70 mt-1 text-right">
                {format(new Date(message.createdAt), 'HH:mm')}
              </div>
            )}
          </div>
          
          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(reactionCounts).map(([emoji, count]) => {
                const hasReacted = message.reactions.some(r => r.userId === currentUserId && r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => onAddReaction(message.id, emoji)}
                    className={`
                      text-xs px-2 py-1 rounded-full border flex items-center gap-1
                      transition-colors
                      ${hasReacted 
                        ? 'bg-primary/10 border-primary/30 text-primary' 
                        : 'bg-background border-border hover:bg-muted'
                      }
                    `}
                  >
                    <span>{emoji}</span>
                    <span className="font-medium">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Quick reactions (shown on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <div className="flex items-center gap-1">
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onAddReaction(message.id, emoji)}
                  className="text-sm p-1 rounded hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onReply(message)}
              >
                <Reply className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-8">
          {isOwn && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const TypingIndicatorComponent: React.FC = () => {
    if (typingUsers.length === 0) return null;
    
    const names = typingUsers.map(t => t.user.name).join(', ');
    const verb = typingUsers.length === 1 ? 'is' : 'are';
    
    return (
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground italic">
        <div className="flex items-center justify-center w-8 h-8">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <span>{names} {verb} typing...</span>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <Badge variant="outline" className="text-xs">
                {formatMessageDate(group.date)}
              </Badge>
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-3">
              {group.messages.map((message, messageIndex) => {
                const previousMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : 
                  groupIndex > 0 ? groupedMessages[groupIndex - 1].messages.slice(-1)[0] : undefined;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showAvatar={shouldShowAvatar(message, previousMessage)}
                    isOwn={message.authorId === currentUserId}
                  />
                );
              })}
            </div>
          </div>
        ))}
        
        <TypingIndicatorComponent />
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};