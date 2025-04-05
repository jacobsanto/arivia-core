import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "../ChatMessage";
import TypingIndicator from "../typing/TypingIndicator";
import { Message } from "@/hooks/useChatTypes";

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
}) => {
  return (
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6">
        {messages.map((msg) => (
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
        ))}
      </div>
      
      {/* Typing indicator */}
      <TypingIndicator typingStatus={typingStatus} activeChat={activeChat} />
    </ScrollArea>
  );
};

export default MessageList;
