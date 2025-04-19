
import { useUser } from "@/contexts/UserContext";
import { Message } from "@/hooks/useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Attachment } from "./useAttachments";
import { v4 as uuidv4 } from "uuid";

export function useMessageSubmission(
  chatType: 'general' | 'direct',
  recipientId: string | undefined,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  isOffline: boolean
) {
  const { user } = useUser();

  const submitMessage = async (content: string, attachments: Attachment[]) => {
    if (!user) return;

    const tempId = `temp-${uuidv4()}`;
    const tempMessage: Message = {
      id: tempId,
      sender: user.name || "You",
      avatar: user.avatar || "/placeholder.svg",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
      reactions: {},
      attachments: attachments.map(a => ({
        id: a.id,
        type: a.type,
        url: a.preview,
        name: a.file.name
      }))
    };

    setMessages(prev => [...prev, tempMessage]);

    if (isOffline) {
      // Offline handling will be done by useOfflineMessages
      return tempMessage;
    }

    try {
      if (chatType === 'general' && recipientId) {
        const sentMessage = await chatService.sendChannelMessage({
          channel_id: recipientId,
          user_id: user.id,
          content: content.trim(),
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
          content: content.trim(),
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

      return tempMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Network error"
      });
      return null;
    }
  };

  return { submitMessage };
}
