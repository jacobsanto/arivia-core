
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPresence } from "@/hooks/chat/useUserPresence";
import { useConnectionStatus } from "./channel-loaders/useConnectionStatus";
import { useChannelsLoader } from "./channel-loaders/useChannelsLoader";
import { useDirectMessagesLoader } from "./channel-loaders/useDirectMessagesLoader";
import { useChatSelection } from "./channel-loaders/useChatSelection";
import { FALLBACK_GENERAL_CHANNEL, GENERAL_CHAT_CHANNEL_ID } from "@/services/chat/chat.types";
import { chatService } from "@/services/chat/chat.service";

export function useChannelAndUsers() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Hooks
  const { user } = useAuth();
  const { getUserStatus } = useUserPresence();
  
  // Use our smaller hooks
  const { isConnected, loadError, setLoadError } = useConnectionStatus();
  const { channels } = useChannelsLoader(isConnected);
  const { directMessages } = useDirectMessagesLoader(isConnected, getUserStatus);
  const { 
    activeChatId,
    activeChat,
    chatType,
    handleSelectChat,
    setDefaultGeneralChat
  } = useChatSelection();

  // Ensure the general channel exists when the component loads
  useEffect(() => {
    if (!user || initialized) return;
    
    const initGeneralChannel = async () => {
      try {
        const generalChannel = await chatService.getOrCreateGeneralChannel();
        if (generalChannel) {
          console.log("General channel initialized:", generalChannel.id);
        }
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize general channel:", error);
        setInitialized(true);
      }
    };
    
    initGeneralChannel();
  }, [user, initialized]);

  // Set default channel if no active chat is selected
  useEffect(() => {
    if (activeChatId === "" && channels.length > 0) {
      setDefaultGeneralChat();
    }
  }, [activeChatId, channels, setDefaultGeneralChat]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return {
    channels, 
    directMessages,
    isConnected,
    loadError,
    activeChat,
    activeChatId,
    chatType,
    handleSelectChat,
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar
  };
}
