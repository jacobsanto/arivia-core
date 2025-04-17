
import { useState } from "react";
import { Message } from "../useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";

interface UseMessageReactionsProps {
  chatType: 'general' | 'direct';
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOffline?: boolean;
}

export function useMessageReactions({
  chatType,
  messages,
  setMessages,
  isOffline = false
}: UseMessageReactionsProps) {
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const addReaction = async (messageId: string, emoji: string) => {
    // Update UI immediately for better experience
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          const currentUserReactions = [...(reactions[emoji] || [])];
          
          // Toggle the reaction
          const hasReacted = currentUserReactions.includes('currentUser');
          const updatedEmoji = hasReacted
            ? currentUserReactions.filter(u => u !== 'currentUser')
            : [...currentUserReactions, 'currentUser'];
          
          const updatedReactions = {
            ...reactions,
            [emoji]: updatedEmoji
          };
          
          // Remove empty reaction arrays
          if (updatedEmoji.length === 0) {
            delete updatedReactions[emoji];
          }
          
          return {
            ...msg,
            reactions: updatedReactions
          };
        }
        return msg;
      })
    );
    
    // Reset UI state
    setShowEmojiPicker(false);
    setReactionMessageId(null);

    // Don't try to send to server if offline
    if (isOffline) {
      toast.info("You're in offline mode", {
        description: "Reactions will not be sent to the server"
      });
      return;
    }
    
    if (chatType === 'direct') {
      // Direct messages don't support reactions yet
      return;
    }
    
    try {
      // Send to server
      await chatService.addReaction(messageId, emoji, 'currentUser');
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to save reaction", {
        description: "Please check your connection"
      });
    }
  };

  return {
    reactionMessageId, 
    setReactionMessageId,
    showEmojiPicker, 
    setShowEmojiPicker,
    addReaction
  };
}
