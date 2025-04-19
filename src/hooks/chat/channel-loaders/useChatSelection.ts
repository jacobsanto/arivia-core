
import { useState, useCallback, useEffect, useRef } from "react";
import { GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";

/**
 * Hook to manage chat selection with persistence and debouncing
 */
export function useChatSelection() {
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [activeChat, setActiveChat] = useState<string>("");
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');
  const lastChatChangeRef = useRef<number>(0);
  const pendingChatSelectionRef = useRef<any>(null);

  // Set the default chat to general when needed
  const setDefaultGeneralChat = useCallback(() => {
    const now = Date.now();
    lastChatChangeRef.current = now;
    
    setActiveChatId(GENERAL_CHAT_CHANNEL_ID);
    setActiveChat("General");
    setChatType('general');
    
    // Store in local storage
    try {
      localStorage.setItem('lastChatSelection', JSON.stringify({
        id: GENERAL_CHAT_CHANNEL_ID, 
        name: "General", 
        type: 'general', 
        timestamp: now
      }));
    } catch (e) {
      console.warn("Could not save general chat selection", e);
    }
  }, []);
  
  // Handle chat selection with debouncing
  const handleSelectChat = useCallback((id: string, name: string, type: 'general' | 'direct') => {
    // Clear any pending chat selection
    if (pendingChatSelectionRef.current) {
      clearTimeout(pendingChatSelectionRef.current);
    }
    
    // Prevent rapid chat switching by adding a debounce
    const now = Date.now();
    if (now - lastChatChangeRef.current < 500) {
      console.log("Chat selection debounced - scheduling delayed selection");
      
      // Schedule the selection after debounce period
      pendingChatSelectionRef.current = setTimeout(() => {
        handleSelectChat(id, name, type);
      }, 500);
      
      return;
    }
    
    lastChatChangeRef.current = now;
    
    // If selecting same chat, skip update
    if (id === activeChatId && type === chatType) {
      console.log(`Already on ${type} chat "${name}" (${id}), skipping state update`);
      return;
    }
    
    console.log(`Switching to ${type} chat "${name}" (${id})`);
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
  }, [activeChatId, chatType]);
  
  // Attempt to restore the last selected chat on load
  useEffect(() => {
    if (activeChatId) return; // Already have an active chat
    
    try {
      const savedChatJSON = localStorage.getItem('lastChatSelection');
      if (savedChatJSON) {
        const savedChat = JSON.parse(savedChatJSON);
        
        // Verify that the saved chat has all required fields
        if (savedChat && savedChat.id && savedChat.name && savedChat.type) {
          console.log(`Restoring saved chat: ${savedChat.type} "${savedChat.name}" (${savedChat.id})`);
          setActiveChatId(savedChat.id);
          setActiveChat(savedChat.name);
          setChatType(savedChat.type as 'general' | 'direct');
          lastChatChangeRef.current = savedChat.timestamp || Date.now();
        } else {
          console.warn("Incomplete saved chat data, using default");
          setDefaultGeneralChat();
        }
      } else {
        console.log("No saved chat selection found, using default");
        setDefaultGeneralChat();
      }
    } catch (e) {
      console.warn("Could not restore last chat selection", e);
      setDefaultGeneralChat();
    }
  }, [activeChatId, setDefaultGeneralChat]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pendingChatSelectionRef.current) {
        clearTimeout(pendingChatSelectionRef.current);
      }
    };
  }, []);

  return {
    activeChatId,
    activeChat,
    chatType,
    handleSelectChat,
    setDefaultGeneralChat
  };
}
