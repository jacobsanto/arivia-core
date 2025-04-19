
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "@/hooks/useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { useAttachments } from "./useAttachments";
import { useEmojiPicker } from "./useEmojiPicker";
import { useOfflineMessages } from "./useOfflineMessages";
import { v4 as uuidv4 } from "uuid";

interface UseMessageSenderProps {
  chatType: 'general' | 'direct';
  recipientId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearTyping: () => void;
  isOffline: boolean;
}

export function useMessageSender({ 
  chatType, 
  recipientId, 
  messages, 
  setMessages,
  clearTyping,
  isOffline
}: UseMessageSenderProps) {
  const [messageInput, setMessageInput] = useState("");
  const [sendError, setSendError] = useState<Error | null>(null);
  const { user } = useUser();
  
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

  const handleEmojiSelect = (emoji: string) => {
    baseHandleEmojiSelect(emoji, setMessageInput);
  };

  const sendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !user) {
      return;
    }

    setSendError(null);

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender: user.name || "You",
      avatar: user.avatar || "/placeholder.svg",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
      reactions: {},
      attachments: attachments.map(a => ({
        id: a.id,
        type: a.type,
        url: a.preview,
        name: a.file.name,
      }))
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageInput("");
    clearAttachments();
    clearTyping();
    setShowEmojiPicker(false);

    if (isOffline) {
      handleOfflineMessage(tempMessage, chatType, recipientId || '', user.id, attachments);
      return;
    }

    try {
      if (chatType === 'general' && recipientId) {
        const sentMessage = await chatService.sendChannelMessage({
          channel_id: recipientId,
          user_id: user.id,
          content: tempMessage.content,
          is_read: false,
          attachments: attachments.map(a => ({
            id: a.id,
            file: a.file,
            type: a.type,
            name: a.file.name
          }))
        });
        
        if (sentMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? {
                ...msg,
                id: sentMessage.id,
                timestamp: sentMessage.created_at || msg.timestamp,
                attachments: sentMessage.attachments || msg.attachments
              } : msg
            )
          );
        }
      } else if (chatType === 'direct' && recipientId) {
        const directMessage = await chatService.sendDirectMessage({
          sender_id: user.id,
          recipient_id: recipientId,
          content: tempMessage.content,
          is_read: false,
          attachments: attachments.map(a => ({
            id: a.id,
            file: a.file,
            type: a.type,
            name: a.file.name
          }))
        });
        
        if (directMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? {
                ...msg,
                id: directMessage.id,
                timestamp: directMessage.created_at || msg.timestamp,
                attachments: directMessage.attachments || msg.attachments
              } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError(error instanceof Error ? error : new Error("Failed to send message"));
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? {
            ...msg,
            error: true,
            errorMessage: error instanceof Error ? error.message : "Network error"
          } : msg
        )
      );
      
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Network error"
      });
    }
  };

  return {
    messageInput,
    setMessageInput,
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
