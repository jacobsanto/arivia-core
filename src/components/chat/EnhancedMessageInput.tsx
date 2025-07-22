import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedMessageInputProps {
  message: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  message,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleBlur = useCallback(() => {
    if (!message.trim()) {
      setIsExpanded(false);
    }
  }, [message]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  }, [onSubmit]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  return (
    <form onSubmit={onSubmit} className={cn("p-4 border-t bg-background", className)}>
      <div className={cn(
        "flex items-end gap-2 rounded-lg border bg-card p-3 transition-all duration-200",
        isExpanded && "shadow-md"
      )}>
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 w-8 p-0"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[36px] max-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
            rows={1}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {isExpanded && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={disabled}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !message.trim()}
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};