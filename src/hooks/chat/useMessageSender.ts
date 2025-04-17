
import { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { offlineManager } from "@/utils/offlineManager";
import { v4 as uuidv4 } from "uuid";

export interface Attachment {
  id: string;
  file: File;
  type: string;
  preview: string;
}

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleImageSelect = (files: FileList) => {
    const newAttachments = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      // Revoke object URL to prevent memory leaks
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.preview);
      }
      
      return prev.filter(a => a.id !== id);
    });
  };

  const clearAttachments = () => {
    // Revoke all object URLs to prevent memory leaks
    attachments.forEach(attachment => {
      URL.revokeObjectURL(attachment.preview);
    });
    
    setAttachments([]);
  };

  const sendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !user) {
      return;
    }

    // Reset error state
    setSendError(null);

    // Create a temporary message to show immediately
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

    // Add the message to the list
    setMessages(prev => [...prev, tempMessage]);
    
    // Clear the input and attachments
    setMessageInput("");
    clearAttachments();
    clearTyping();
    setShowEmojiPicker(false);

    // If offline, store for later sync
    if (isOffline) {
      offlineManager.storeOfflineData('message', 'create', {
        chatType,
        recipientId,
        content: tempMessage.content,
        sender_id: user.id,
        attachments: attachments.map(a => ({
          id: a.id,
          type: a.type,
          name: a.file.name,
          // Store the file itself in indexedDB for later upload
          file: a.file
        }))
      });
      toast.info("Message saved for later sending", {
        description: "Will be sent when you reconnect"
      });
      return;
    }

    try {
      if (chatType === 'general' && recipientId) {
        // Send to channel
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
        
        // Replace the temp message with the real one if we got a response
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
        // Send direct message
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
        
        // Replace the temp message if we got a response
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
      
      // Mark message as failed
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
