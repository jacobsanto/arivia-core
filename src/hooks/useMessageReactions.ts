
import { useState } from "react";
import { Message } from "./useChatTypes";

interface UseMessageReactionsProps {
  chatType: 'general' | 'direct';
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOffline?: boolean;
}

export const useMessageReactions = ({ 
  chatType,
  messages, 
  setMessages,
  isOffline = false 
}: UseMessageReactionsProps) => {
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const addReaction = (messageId: string, emoji: string, username: string = "You") => {
    // Don't process reactions when offline
    if (isOffline) {
      console.log("Cannot add reactions in offline mode");
      return;
    }
    
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Don't allow adding reactions to own messages
          if (msg.isCurrentUser) {
            return msg;
          }
          
          // Handle case when reactions might be undefined
          const reactions = msg.reactions || {};
          const userList = reactions[emoji] || [];
          
          const hasReacted = userList.includes(username);
          
          const updatedReactions = {
            ...reactions,
            [emoji]: hasReacted 
              ? userList.filter(name => name !== username) 
              : [...userList, username]
          };

          // Remove empty reaction arrays
          const finalReactions = Object.fromEntries(
            Object.entries(updatedReactions).filter(([_, users]) => users.length > 0)
          );
          
          return {
            ...msg,
            reactions: finalReactions
          };
        }
        return msg;
      })
    );
    
    // Close emoji picker after selecting an emoji
    setShowEmojiPicker(false);
    setReactionMessageId(null);
  };

  return {
    reactionMessageId, 
    setReactionMessageId,
    showEmojiPicker, 
    setShowEmojiPicker,
    addReaction
  };
};
