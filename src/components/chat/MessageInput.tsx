import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types/chat.types';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { useAttachments } from '@/hooks/chat/message/useAttachments';
import { useEmojiPicker } from '@/hooks/chat/message/useEmojiPicker';
import FileInputs from '@/components/chat/input/FileInputs';
import InlineEmojiPicker from '@/components/chat/emoji/InlineEmojiPicker';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: any[]) => void;
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

  // Attachment and emoji functionality
  const {
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    clearAttachments
  } = useAttachments();

  const {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  } = useEmojiPicker();

  // Common emojis for the picker
  const commonEmojis = ['😀', '😂', '🥰', '😍', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉'];

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      clearAttachments();
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

  const handleEmojiClick = (emoji: string) => {
    handleEmojiSelect(emoji, setMessage);
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
      <div className="flex items-end gap-2 relative">
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
        
        <div className="flex items-center gap-1 relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={handleFileClick}
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={toggleEmojiPicker}
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <InlineEmojiPicker
              emojis={commonEmojis}
              onEmojiClick={handleEmojiClick}
              onClose={toggleEmojiPicker}
            />
          )}
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative bg-muted rounded-lg p-2 max-w-xs">
              <div className="flex items-center gap-2">
                {attachment.type.startsWith('image/') ? (
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                    <Paperclip className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file inputs */}
      <FileInputs
        onFileSelect={(files) => handleFileSelect({ target: { files } } as any)}
        onImageSelect={(files) => handleImageSelect({ target: { files } } as any)}
        fileInputRef={fileInputRef}
        imageInputRef={imageInputRef}
      />
    </div>
  );
};