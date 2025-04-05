
import { useState } from "react";
import { Message } from "./useChatTypes";

export const useMessageReactions = (messages: Message[], setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const [reactionMessageId, setReactionMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const addReaction = (messageId: number, emoji: string, username: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          if (msg.isCurrentUser) {
            return msg;
          }
          
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
  };

  return {
    reactionMessageId, 
    setReactionMessageId,
    showEmojiPicker, 
    setShowEmojiPicker,
    addReaction
  };
};
