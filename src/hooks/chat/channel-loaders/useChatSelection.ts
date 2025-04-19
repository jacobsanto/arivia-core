
import { useState, useCallback, useEffect } from "react";
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";

export function useChatSelection() {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [activeChat, setActiveChat] = useState<string>("");
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');
  const [lastChatChange, setLastChatChange] = useState<number>(0);

  // Set the default chat to general when needed
  const setDefaultGeneralChat = useCallback(() => {
    setActiveChatId(GENERAL_CHAT_CHANNEL_ID);
    setActiveChat("General");
    setChatType('general');
  }, []);
  
  // Handle chat selection with debouncing
  const handleSelectChat = useCallback((id: string, name: string, type: 'general' | 'direct') => {
    // Prevent rapid chat switching by adding a small debounce
    const now = Date.now();
    if (now - lastChatChange < 500) {
      console.log("Chat selection throttled - switching too fast");
      return;
    }
    
    setLastChatChange(now);
    setActiveChatId(id);
    setActiveChat(name);
    setChatType(type);
    
    // Store last selected chat in local storage
    try {
      localStorage.setItem('lastChatSelection', JSON.stringify({
        id, name, type, timestamp: now
      }));
    } catch (e) {
      console.warn("Could not save last chat selection", e);
    }
  }, [lastChatChange]);
  
  // Attempt to restore the last selected chat on load
  useEffect(() => {
    if (activeChatId) return; // Already have an active chat
    
    try {
      const savedChat = localStorage.getItem('lastChatSelection');
      if (savedChat) {
        const { id, name, type } = JSON.parse(savedChat);
        setActiveChatId(id);
        setActiveChat(name);
        setChatType(type as 'general' | 'direct');
      }
    } catch (e) {
      console.warn("Could not restore last chat selection", e);
    }
  }, [activeChatId]);

  return {
    activeChatId,
    activeChat,
    chatType,
    handleSelectChat,
    setDefaultGeneralChat
  };
}
