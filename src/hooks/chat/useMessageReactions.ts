
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { Message } from "../useChatTypes";

interface UseMessageReactionsProps {
  chatType: 'general' | 'direct';
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useMessageReactions({ 
  chatType, 
  messages, 
  setMessages 
}: UseMessageReactionsProps) {
  const { user } = useUser();

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
          const currentReactions = { ...msg.reactions } || {};
          
          const usersForEmoji = currentReactions[emoji] || [];
          const username = user.name || "Unknown";
          
          const userIndex = usersForEmoji.indexOf(username);
          
          if (userIndex >= 0) {
            currentReactions[emoji] = [
              ...usersForEmoji.slice(0, userIndex),
              ...usersForEmoji.slice(userIndex + 1)
            ];
            if (currentReactions[emoji].length === 0) {
              delete currentReactions[emoji];
            }
          } else {
            currentReactions[emoji] = [...usersForEmoji, username];
          }
          
          return {
            ...msg,
            reactions: currentReactions
          };
        }
        return msg;
      });
      
      setMessages(updatedMessages);
      
      if (chatType === 'general') {
        await chatService.addReaction(messageId, emoji, user.id);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  return { addReaction };
}
