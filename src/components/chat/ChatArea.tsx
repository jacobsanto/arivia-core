import React from "react";
import ChatHeader from "./header/ChatHeader";
import MessageList from "./messages/MessageList";
import MessageInput from "./input/MessageInput";
import { Message } from "@/hooks/useChatTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";
import { Attachment } from "@/hooks/chat/message/useAttachments";

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
  onAddReaction: (emoji: string, messageId: string) => void;
  reactionMessageId: string | null;
  setReactionMessageId: (id: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  isLoading?: boolean;
  isOffline?: boolean;
  attachments?: Attachment[];
  fileInputRef?: React.RefObject<HTMLInputElement>;
  imageInputRef?: React.RefObject<HTMLInputElement>;
  handleFileSelect?: (files: FileList) => void;
  handleImageSelect?: (files: FileList) => void;
  handleFileClick?: () => void;
  handleImageClick?: () => void;
  removeAttachment?: (id: string) => void;
  showMessageEmojiPicker?: boolean;
  toggleMessageEmojiPicker?: () => void;
  handleEmojiSelect?: (emoji: string) => void;
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
  isLoading = false,
  isOffline = false,
  attachments = [],
  fileInputRef,
  imageInputRef,
  handleFileSelect,
  handleImageSelect,
  handleFileClick,
  handleImageClick,
  removeAttachment,
  showMessageEmojiPicker = false,
  toggleMessageEmojiPicker,
  handleEmojiSelect,
}) => {
  return (
    <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
      <ChatHeader 
        activeChat={activeChat} 
        activeTab={activeTab} 
        toggleSidebar={toggleSidebar}
        isOffline={isOffline} 
      />
      
      {isOffline && (
        <div className="bg-amber-50 px-4 py-2 flex items-center gap-2">
          <WifiOff size={16} className="text-amber-600" />
          <span className="text-amber-800 text-sm">
            Offline mode - messages will not be sent to the server
          </span>
        </div>
      )}
      
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
        isLoading={isLoading}
        isOffline={isOffline}
      />
      
      {fileInputRef && imageInputRef && handleFileSelect && handleImageSelect && 
       handleFileClick && handleImageClick && removeAttachment && toggleMessageEmojiPicker && 
       handleEmojiSelect && (
        <MessageInput 
          message={message}
          activeChat={activeChat}
          handleChangeMessage={handleChangeMessage}
          handleSendMessage={handleSendMessage}
          isOffline={isOffline}
          attachments={attachments}
          fileInputRef={fileInputRef}
          imageInputRef={imageInputRef}
          handleFileSelect={handleFileSelect}
          handleImageSelect={handleImageSelect}
          handleFileClick={handleFileClick}
          handleImageClick={handleImageClick}
          removeAttachment={removeAttachment}
          showEmojiPicker={showMessageEmojiPicker}
          toggleEmojiPicker={toggleMessageEmojiPicker}
          handleEmojiSelect={handleEmojiSelect}
        />
      )}
    </div>
  );
};

export default ChatArea;
