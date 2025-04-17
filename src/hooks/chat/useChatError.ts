
import { useState, useEffect } from "react";
import { toast } from "sonner";

export type ErrorType = 'loading' | 'sending' | 'reaction' | 'connection' | 'offline' | 'general';

export interface ChatError {
  id: string;
  type: ErrorType;
  message: string;
  timestamp: string;
  retry?: () => Promise<void>;
}

export function useChatError() {
  const [errors, setErrors] = useState<ChatError[]>([]);
  
  // Clear old errors (older than 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      setErrors(prev => prev.filter(error => error.timestamp > fiveMinutesAgo));
    }, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const addError = (type: ErrorType, message: string, retry?: () => Promise<void>) => {
    const newError: ChatError = {
      id: `${type}-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      retry
    };
    
    setErrors(prev => [...prev, newError]);
    
    toast.error(getErrorTitle(type), {
      description: message,
      action: retry ? {
        label: "Retry",
        onClick: () => handleRetry(newError.id)
      } : undefined
    });
    
    return newError.id;
  };
  
  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };
  
  const getErrorTitle = (type: ErrorType) => {
    switch (type) {
      case 'loading': return 'Failed to load messages';
      case 'sending': return 'Failed to send message';
      case 'reaction': return 'Failed to add reaction';
      case 'connection': return 'Connection error';
      case 'offline': return 'You are offline';
      case 'general': 
      default: return 'Error';
    }
  };
  
  const handleRetry = async (id: string) => {
    const error = errors.find(err => err.id === id);
    
    if (error?.retry) {
      try {
        toast.loading("Retrying...");
        await error.retry();
        removeError(id);
        toast.success("Retry successful");
      } catch (retryError) {
        toast.error("Retry failed", {
          description: retryError instanceof Error ? retryError.message : "Unknown error"
        });
      }
    }
  };
  
  return {
    errors,
    addError,
    removeError,
    getRecentError: (type?: ErrorType) => {
      if (type) {
        return errors.filter(error => error.type === type).sort((a, b) => 
          b.timestamp.localeCompare(a.timestamp)
        )[0] || null;
      }
      return errors.sort((a, b) => 
        b.timestamp.localeCompare(a.timestamp)
      )[0] || null;
    }
  };
}
