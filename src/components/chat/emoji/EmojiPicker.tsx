
import React from "react";
import { motion } from "framer-motion";

interface EmojiPickerProps {
  emojis: string[];
  onEmojiClick: (emoji: string, e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  emojis,
  onEmojiClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <motion.div
      className="absolute bottom-full mb-2 bg-background/95 shadow-lg rounded-lg border border-border p-1.5 flex z-10 backdrop-blur-sm"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {emojis.map((emoji) => (
        <motion.button
          key={emoji}
          className="hover:bg-secondary rounded-md p-1.5 transition-colors"
          onClick={(e) => onEmojiClick(emoji, e)}
          title={emoji}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default EmojiPicker;
