
import React, { useRef, useLayoutEffect, useCallback, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "../ChatMessage";
import TypingIndicator from "../typing/TypingIndicator";
import { Message } from "@/hooks/useChatTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { WifiOff, AlertCircle } from "lucide-react";

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

const MessageList = ({
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
}: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const lastMessage = scrollArea.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]); // Only scroll on new messages

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
      ref={scrollAreaRef} 
      className="flex-1 p-6 h-full hardware-accelerated will-change-scroll" 
      orientation="vertical"
    >
      <div className="space-y-6 min-h-[calc(100%-80px)]">
        {messages.length === 0 ? (
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
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              emojis={emojis}
              onAddReaction={onAddReaction}
              reactionMessageId={reactionMessageId}
              setReactionMessageId={setReactionMessageId}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
            />
          ))
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

// Optimize re-renders with memo
export default memo(MessageList, (prevProps, nextProps) => {
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.typingStatus === nextProps.typingStatus &&
    prevProps.isOffline === nextProps.isOffline &&
    prevProps.showEmojiPicker === nextProps.showEmojiPicker &&
    prevProps.reactionMessageId === nextProps.reactionMessageId
  );
});
