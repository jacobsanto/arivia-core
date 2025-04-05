
import React from "react";

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
    <div
      className="absolute bottom-full mb-2 bg-background/95 shadow-lg rounded-lg border border-border p-1.5 flex z-10"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="hover:bg-secondary rounded-md p-1.5 transition-colors"
          onClick={(e) => onEmojiClick(emoji, e)}
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
