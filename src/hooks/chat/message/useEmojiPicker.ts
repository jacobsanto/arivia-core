
import { useState, useCallback } from 'react';

export function useEmojiPicker() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string, setValue: (value: string) => void) => {
    setValue(emoji);
    setShowEmojiPicker(false);
  }, []);

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  };
}
