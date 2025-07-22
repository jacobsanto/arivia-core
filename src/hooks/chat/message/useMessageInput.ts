
import { useState, useCallback } from 'react';

export function useMessageInput(chatId: string) {
  const [messageInput, setMessageInput] = useState('');

  // Fix to accept string value directly, not event object
  const handleChangeMessage = useCallback((value: string) => {
    setMessageInput(value);
  }, []);

  const clearMessageInput = useCallback(() => {
    setMessageInput('');
  }, []);

  return {
    messageInput,
    handleChangeMessage,
    clearMessageInput
  };
}
