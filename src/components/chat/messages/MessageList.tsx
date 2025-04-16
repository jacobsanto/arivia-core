
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "../ChatMessage";
import TypingIndicator from "../typing/TypingIndicator";
import { Message } from "@/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
  emojis: string[];
  onAddReaction: (messageId: number, emoji: string) => void;
  reactionMessageId: number | null;
  setReactionMessageId: (id: number | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  typingStatus: string;
  activeChat: string;
  isLoading?: boolean;
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
}) => {
  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-6">
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
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
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
      
      {/* Typing indicator */}
      <TypingIndicator typingStatus={typingStatus} activeChat={activeChat} />
    </ScrollArea>
  );
};

export default MessageList;
