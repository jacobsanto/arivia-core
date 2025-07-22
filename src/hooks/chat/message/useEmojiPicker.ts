
import { useState, useCallback } from 'react';

export function useEmojiPicker() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string, handleChangeMessage: (e: any) => void) => {
    // Simulate adding emoji to message input
    const syntheticEvent = {
      target: { value: emoji }
    };
    handleChangeMessage(syntheticEvent);
    setShowEmojiPicker(false);
  }, []);

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  };
}
