
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useUserPresence } from "@/hooks/chat/useUserPresence";
import { useConnectionStatus } from "./channel-loaders/useConnectionStatus";
import { useChannelsLoader } from "./channel-loaders/useChannelsLoader";
import { useDirectMessagesLoader } from "./channel-loaders/useDirectMessagesLoader";
import { useChatSelection } from "./channel-loaders/useChatSelection";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types";

export function useChannelAndUsers() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hooks
  const { user } = useUser();
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

  // Set default channel if no active chat is selected
  if (activeChatId === "" && channels.length > 0) {
    setDefaultGeneralChat();
  }

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
