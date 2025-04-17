
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { loadChannelMessages } from "./message-loaders/channelMessageLoader";
import { loadDirectMessages } from "./message-loaders/directMessageLoader";
import { getErrorMessages } from "./message-loaders/errorMessageHelper";

export function useMessageLoader(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { user } = useUser();

  useEffect(() => {
    // Don't load messages if we don't have a user or recipient
    if (!user || !recipientId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Reset state when changing chats
    setMessages([]);
    setLoading(true);
    setIsOffline(false);
    setLoadError(null);

    const loadData = async () => {
      try {
        let loadedMessages: Message[] = [];
        
        if (chatType === 'general') {
          loadedMessages = await loadChannelMessages(user, setIsOffline);
        } else if (chatType === 'direct') {
          loadedMessages = await loadDirectMessages(user, recipientId, setIsOffline);
        }
        
        setMessages(loadedMessages);
      } catch (err) {
        console.error("Error loading messages:", err);
        setLoadError(err instanceof Error ? err : new Error("Unknown error loading messages"));
        setMessages(getErrorMessages());
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, recipientId, chatType]);

  return { messages, setMessages, loading, isOffline, loadError };
}
