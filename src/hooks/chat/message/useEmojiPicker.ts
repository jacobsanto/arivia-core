
import { useState } from "react";

export function useEmojiPicker() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: string, setMessageInput: (value: string) => void) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  };
}
