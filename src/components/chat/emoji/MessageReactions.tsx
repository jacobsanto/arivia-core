
import React from "react";
import { MessageReaction } from "@/hooks/useChatTypes";
import { motion } from "framer-motion";

interface MessageReactionsProps {
  reactions: MessageReaction;
  onEmojiClick: (emoji: string, e: React.MouseEvent) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions, onEmojiClick }) => {
  // Return early if no reactions
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap mt-1 gap-1">
      {Object.entries(reactions).map(([emoji, users]) => (
        <motion.button
          key={emoji}
          className="bg-muted hover:bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs flex items-center gap-1 border border-border/40"
          onClick={(e) => onEmojiClick(emoji, e)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          title={`${users.join(", ")}`}
        >
          <span>{emoji}</span>
          <span className="font-semibold">{users.length}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default MessageReactions;
