
import { useState, useEffect } from "react";
import { Message } from "./useChatTypes";
import { getSampleMessages } from "@/utils/messageUtils";

export const useMessageStorage = (activeChat: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load messages from localStorage or use sample data
  useEffect(() => {
    const storedMessages = localStorage.getItem(`chat_${activeChat}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(getSampleMessages());
    }
  }, [activeChat]);

  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`chat_${activeChat}`, JSON.stringify(messages));
  }, [messages, activeChat]);

  return {
    messages,
    setMessages,
  };
};
