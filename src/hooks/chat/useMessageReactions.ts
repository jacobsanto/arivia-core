
import { useState } from "react";
import { Message } from "../useChatTypes";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { offlineManager } from "@/utils/offlineManager";

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
  const [reactionError, setReactionError] = useState<Error | null>(null);
  
  const addReaction = async (messageId: string, emoji: string) => {
    // Reset error state
    setReactionError(null);
    
    // Update UI immediately for better experience
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Don't allow adding reactions to own messages
          if (msg.isCurrentUser) {
            return msg;
          }
          
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

    // Handle offline mode
    if (isOffline) {
      offlineManager.storeOfflineData('reaction', 'create', {
        messageId,
        emoji,
        chatType
      });
      
      toast.info("Reaction saved for later", {
        description: "Will be synced when you reconnect"
      });
      return;
    }
    
    try {
      if (chatType === 'direct') {
        // For now, direct messages don't support reactions on server
        // This is a UI-only feature until backend support is added
        toast.info("Direct message reactions are only visible to you", {
          description: "This feature is not synced with the server yet"
        });
        return;
      }
      
      // Send to server for general chat
      await chatService.addReaction(messageId, emoji, 'currentUser');
    } catch (error) {
      console.error("Failed to add reaction:", error);
      setReactionError(error instanceof Error ? error : new Error("Failed to add reaction"));
      
      toast.error("Failed to save reaction", {
        description: error instanceof Error ? error.message : "Network error"
      });
    }
  };

  return {
    reactionMessageId, 
    setReactionMessageId,
    showEmojiPicker, 
    setShowEmojiPicker,
    addReaction,
    reactionError
  };
}
