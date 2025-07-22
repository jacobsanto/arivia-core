
import { useState, useCallback } from 'react';

export interface ChatError {
  id: string;
  type: 'connection' | 'general' | 'loading' | 'offline' | 'sending' | 'reaction';
  message: string;
  timestamp: number;
  retry?: () => void;
}

export function useChatError() {
  const [errors, setErrors] = useState<ChatError[]>([]);

  const addError = useCallback((type: ChatError['type'], message: string) => {
    const error: ChatError = {
      id: `${type}-${Date.now()}`,
      type,
      message,
      timestamp: Date.now()
    };
    
    setErrors(prev => {
      // Remove existing errors of the same type to prevent duplicates
      const filtered = prev.filter(err => err.type !== type);
      return [...filtered, error];
    });
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(err => err.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
}
