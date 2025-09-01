import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types/chat.types';
import { MessageSquare, CornerDownRight } from 'lucide-react';
import { format } from 'date-fns';

interface MessageThreadProps {
  parentMessage: ChatMessage;
  replies: ChatMessage[];
  onOpenThread: () => void;
  onReply: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  parentMessage,
  replies,
  onOpenThread,
  onReply
}) => {
  const replyCount = replies.length;
  const lastReply = replies[replies.length - 1];
  const uniqueRepliers = [...new Set(replies.map(r => r.authorId))];

  if (replyCount === 0) return null;

  return (
    <div className="mt-2 border-l-2 border-muted pl-3 space-y-2">
      {/* Thread Summary */}
      <div 
        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onOpenThread}
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {uniqueRepliers.length} {uniqueRepliers.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          
          {lastReply && (
            <p className="text-sm text-muted-foreground truncate">
              <span className="font-medium">{lastReply.author.name}</span>: {lastReply.content}
            </p>
          )}
        </div>
        
        {lastReply && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(lastReply.createdAt), 'HH:mm')}
          </span>
        )}
      </div>

      {/* Show last few replies inline */}
      {replies.slice(-2).map((reply, index) => (
        <div key={reply.id} className="flex items-start gap-2 text-sm">
          <CornerDownRight className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">{reply.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(reply.createdAt), 'HH:mm')}
              </span>
            </div>
            <p className="text-muted-foreground">{reply.content}</p>
          </div>
        </div>
      ))}

      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-primary hover:text-primary"
        onClick={onReply}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Reply to thread
      </Button>
    </div>
  );
};