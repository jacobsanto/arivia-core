
import { useState, useCallback } from "react";
import { Message } from "../useChatTypes";

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
  const [reactionError, setReactionError] = useState<Error | null>(null);
  
  const addReaction = useCallback((emoji: string, messageId: string, username: string = "You") => {
    if (isOffline) {
      console.log("Cannot add reactions in offline mode");
      return;
    }
    
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId && !msg.isCurrentUser) {
          const reactions = msg.reactions || {};
          const userList = reactions[emoji] || [];
          const hasReacted = userList.includes(username);
          
          const updatedReactions = {
            ...reactions,
            [emoji]: hasReacted 
              ? userList.filter(name => name !== username) 
              : [...userList, username]
          };

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
    
    setShowEmojiPicker(false);
    setReactionMessageId(null);
  }, [isOffline, setMessages]);

  return {
    reactionMessageId, 
    setReactionMessageId,
    showEmojiPicker, 
    setShowEmojiPicker,
    addReaction,
    reactionError
  };
};
