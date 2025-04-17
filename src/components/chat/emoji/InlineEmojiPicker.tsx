
import React from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface InlineEmojiPickerProps {
  emojis: string[];
  onEmojiClick: (emoji: string, e: React.MouseEvent) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const InlineEmojiPicker: React.FC<InlineEmojiPickerProps> = ({
  emojis,
  onEmojiClick,
  onClose,
  isLoading = false,
}) => {
  return (
    <motion.div
      className="absolute z-10 bottom-full mb-2 bg-background shadow-lg rounded-lg border border-border p-3 flex flex-wrap max-w-xs gap-2 backdrop-blur-sm"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {isLoading ? (
        <div className="p-4 flex justify-center items-center w-full">
          <LoadingSpinner size="small" />
        </div>
      ) : (
        emojis.map((emoji) => (
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
        ))
      )}
    </motion.div>
  );
};

export default InlineEmojiPicker;
