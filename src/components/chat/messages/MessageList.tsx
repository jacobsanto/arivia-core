
import React, { useCallback, useRef, useEffect, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MemoizedMessage from "../message/MemoizedMessage";
import TypingIndicator from "../typing/TypingIndicator";
import { Message } from "@/hooks/useChatTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { WifiOff, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface MessageListProps {
  messages: Message[];
  emojis: string[];
  onAddReaction: (messageId: string, emoji: string) => void;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  typingStatus: string;
  activeChat: string;
  isLoading?: boolean;
  isOffline?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
  typingStatus,
  activeChat,
  isLoading = false,
  isOffline = false,
}) => {
  // Create a ref for scrolling to bottom
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const lastActiveChat = useRef(activeChat);
  
  // Scroll to bottom when new messages arrive or chat changes
  useEffect(() => {
    const shouldScrollToBottom = 
      messages.length !== lastMessageCountRef.current || 
      activeChat !== lastActiveChat.current ||
      typingStatus !== '';
      
    if (shouldScrollToBottom && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
    
    // Update refs
    lastMessageCountRef.current = messages.length;
    lastActiveChat.current = activeChat;
  }, [messages, typingStatus, activeChat]);

  // Memoize the empty state to prevent re-renders
  const renderEmptyState = useCallback(() => (
    <div className="flex flex-col justify-center items-center h-40 gap-2">
      {isOffline ? (
        <>
          <WifiOff className="h-10 w-10 text-amber-500" />
          <p className="text-muted-foreground">You are in offline mode. Messages cannot be loaded.</p>
        </>
      ) : (
        <>
          <AlertCircle className="h-10 w-10 text-blue-500" />
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </>
      )}
    </div>
  ), [isOffline]);

  // Show loading state
  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-6 h-full">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-20 w-[300px]" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea 
      className="flex-1 p-6 h-full relative" 
      orientation="vertical"
      ref={scrollAreaRef}
    >
      <div className="space-y-6 min-h-[calc(100%-80px)]">
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((msg) => (
              <MemoizedMessage
                key={`${msg.id}-${JSON.stringify(msg.reactions)}`}
                message={msg}
                emojis={emojis}
                onAddReaction={onAddReaction}
                reactionMessageId={reactionMessageId}
                setReactionMessageId={setReactionMessageId}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {!isOffline && typingStatus && (
        <TypingIndicator typingStatus={typingStatus} activeChat={activeChat} />
      )}
      
      {isOffline && messages.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-amber-600">
          <WifiOff className="h-4 w-4" />
          <span>Offline mode - showing cached messages</span>
        </div>
      )}
    </ScrollArea>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageList);
