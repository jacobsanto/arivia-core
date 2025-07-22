
import { useState, useCallback } from 'react';

export function useMessageInput(chatId: string) {
  const [messageInput, setMessageInput] = useState('');

  const handleChangeMessage = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
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
