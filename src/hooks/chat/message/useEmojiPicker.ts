
import { useState } from "react";

export function useEmojiPicker() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: string, setMessageInput: (value: string | ((prev: string) => string)) => void) => {
    setMessageInput((prev: string) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  };
}
