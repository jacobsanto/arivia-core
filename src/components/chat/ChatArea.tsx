
import React from "react";
import { Message } from "@/hooks/useChatTypes";
import ChatHeader from "./header/ChatHeader";
import MessageList from "./messages/MessageList";
import MessageInput from "./input/MessageInput";

interface ChatAreaProps {
  activeChat: string;
  activeTab: string;
  messages: Message[];
  message: string;
  typingStatus: string;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  toggleSidebar: () => void;
  emojis: string[];
  onAddReaction: (messageId: number, emoji: string) => void;
  reactionMessageId: number | null;
  setReactionMessageId: (id: number | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  activeTab,
  messages,
  message,
  typingStatus,
  handleChangeMessage,
  handleSendMessage,
  toggleSidebar,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  return (
    <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
      <ChatHeader 
        activeChat={activeChat} 
        activeTab={activeTab} 
        toggleSidebar={toggleSidebar} 
      />
      
      <MessageList 
        messages={messages}
        emojis={emojis}
        onAddReaction={onAddReaction}
        reactionMessageId={reactionMessageId}
        setReactionMessageId={setReactionMessageId}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        typingStatus={typingStatus}
        activeChat={activeChat}
      />
      
      <MessageInput 
        message={message}
        activeChat={activeChat}
        handleChangeMessage={handleChangeMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatArea;
