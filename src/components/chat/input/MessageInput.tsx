import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, WifiOff } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MessageToolbar from "./MessageToolbar";
import FileInputs from "./FileInputs";
import InlineEmojiPicker from "../emoji/InlineEmojiPicker";
import { Attachment } from "@/hooks/chat/message/useAttachments";

interface MessageInputProps {
  message: string;
  activeChat: string;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isOffline?: boolean;
  attachments?: Attachment[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (files: FileList) => void;
  handleImageSelect: (files: FileList) => void;
  handleFileClick: () => void;
  handleImageClick: () => void;
  removeAttachment: (id: string) => void;
  showEmojiPicker: boolean;
  toggleEmojiPicker: () => void;
  handleEmojiSelect: (emoji: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  activeChat,
  handleChangeMessage,
  handleSendMessage,
  isOffline = false,
  attachments = [],
  fileInputRef,
  imageInputRef,
  handleFileSelect,
  handleImageSelect,
  handleFileClick,
  handleImageClick,
  removeAttachment,
  showEmojiPicker,
  toggleEmojiPicker,
  handleEmojiSelect,
}) => {
  // Common emoji collection
  const emojis = ["😊", "👍", "🎉", "❤️", "😂", "🤔", "👏", "🙏", "🔥", "⭐", "😍", "😎", "🤩", "😢", "😡", "🤯", "🤝", "👋", "✅", "❌"];
  
  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    handleEmojiSelect(emoji);
  };
  
  return (
    <form onSubmit={handleSendMessage} className="border-t">
      <MessageToolbar 
        onFileClick={handleFileClick}
        onImageClick={handleImageClick}
        onEmojiToggle={toggleEmojiPicker}
        showEmojiPicker={showEmojiPicker}
        isOffline={isOffline}
        attachments={attachments.map(a => ({
          id: a.id,
          type: a.type,
          preview: a.preview
        }))}
        onRemoveAttachment={removeAttachment}
      />
      
      <div className="p-4 pt-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={handleChangeMessage}
              placeholder={isOffline ? "Offline mode - messages will not be sent" : `Message ${activeChat}...`}
              className="min-h-[80px] resize-none"
            />
            
            <AnimatePresence>
              {showEmojiPicker && (
                <div className="absolute bottom-0 left-0">
                  <InlineEmojiPicker
                    emojis={emojis}
                    onEmojiClick={handleEmojiClick}
                    onClose={() => toggleEmojiPicker()}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <Button 
            type="submit"
            size="icon"
            variant="default"
            disabled={!message.trim().length && attachments.length === 0}
            className="h-10 w-10"
          >
            {isOffline ? <WifiOff className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      <FileInputs
        fileInputRef={fileInputRef}
        imageInputRef={imageInputRef}
        onFileSelect={handleFileSelect}
        onImageSelect={handleImageSelect}
      />
    </form>
  );
};

export default MessageInput;
