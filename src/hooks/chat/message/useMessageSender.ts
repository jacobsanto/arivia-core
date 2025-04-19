
import { useState } from "react";
import { Message } from "@/hooks/useChatTypes";
import { useMessageInput } from "./useMessageInput";
import { useMessageSubmission } from "./useMessageSubmission";
import { useAttachments } from "./useAttachments";
import { useEmojiPicker } from "./useEmojiPicker";
import { useOfflineMessages } from "./useOfflineMessages";

interface UseMessageSenderProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOffline: boolean;
}

export function useMessageSender({ 
  chatType, 
  recipientId, 
  messages, 
  setMessages,
  isOffline
}: UseMessageSenderProps) {
  const [sendError, setSendError] = useState<Error | null>(null);
  
  const {
    messageInput,
    handleChangeMessage,
    clearMessageInput
  } = useMessageInput(recipientId || 'general');

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
    handleEmojiSelect: baseHandleEmojiSelect
  } = useEmojiPicker();

  const { handleOfflineMessage } = useOfflineMessages();
  const { submitMessage } = useMessageSubmission(chatType, recipientId, messages, setMessages, isOffline);

  const handleEmojiSelect = (emoji: string) => {
    baseHandleEmojiSelect(emoji, handleChangeMessage);
  };

  const sendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0)) {
      return;
    }

    const tempMessage = await submitMessage(messageInput, attachments);
    
    if (tempMessage && isOffline) {
      handleOfflineMessage(
        tempMessage,
        chatType,
        recipientId || '',
        'user-id',
        attachments
      );
    }

    clearMessageInput();
    clearAttachments();
  };

  return {
    messageInput,
    setMessageInput: handleChangeMessage,
    sendMessage,
    sendError,
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  };
}
