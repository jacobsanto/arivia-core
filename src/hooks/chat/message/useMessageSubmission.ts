
import { Message } from '@/hooks/useChatTypes';

export function useMessageSubmission(
  chatType: 'general' | 'direct',
  recipientId: string | undefined,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  isOffline: boolean
) {
  const submitMessage = async (messageContent: string, attachments: any[]) => {
    if (!messageContent.trim() && attachments.length === 0) {
      return null;
    }

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: "You",
      avatar: "/placeholder.svg",
      content: messageContent,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
      reactions: {},
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, tempMessage]);
    return tempMessage;
  };

  return { submitMessage };
}
