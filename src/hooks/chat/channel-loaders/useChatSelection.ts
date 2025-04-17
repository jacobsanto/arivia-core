
import { useState } from "react";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types";

export function useChatSelection() {
  const [activeChatId, setActiveChatId] = useState("");
  const [activeChat, setActiveChat] = useState("General");
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');

  const handleSelectChat = (chatId: string, chatName: string, type: 'general' | 'direct') => {
    setActiveChat(chatName);
    setActiveChatId(chatId);
    setChatType(type);
  };

  const setDefaultGeneralChat = () => {
    setActiveChatId(FALLBACK_GENERAL_CHANNEL.id);
    setActiveChat(FALLBACK_GENERAL_CHANNEL.name);
    setChatType('general');
  };

  return {
    activeChatId,
    activeChat,
    chatType,
    handleSelectChat,
    setDefaultGeneralChat
  };
}
