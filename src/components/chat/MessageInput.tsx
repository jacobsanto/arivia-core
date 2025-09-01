import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types/chat.types';
import { Send, Paperclip, Smile, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
  onStartTyping,
  onStopTyping
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      handleStopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onStartTyping();
    }
    
    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value.trim()) {
      handleStartTyping();
    } else {
      handleStopTyping();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-background p-4">
      {/* Reply preview */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              Replying to {replyingTo.author.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-2"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Message input */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};