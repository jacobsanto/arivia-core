
import { offlineManager } from "@/utils/offlineManager";
import { toast } from "sonner";
import { Message } from "@/hooks/useChatTypes";
import { Attachment } from "./useAttachments";

export function useOfflineMessages() {
  const handleOfflineMessage = (
    tempMessage: Message,
    chatType: 'general' | 'direct',
    recipientId: string,
    userId: string,
    attachments: Attachment[]
  ) => {
    offlineManager.storeOfflineData('message', 'create', {
      chatType,
      recipientId,
      content: tempMessage.content,
      sender_id: userId,
      attachments: attachments.map(a => ({
        id: a.id,
        type: a.type,
        name: a.file.name,
        file: a.file
      }))
    });
    
    toast.info("Message saved for later sending", {
      description: "Will be sent when you reconnect"
    });
  };

  return { handleOfflineMessage };
}
