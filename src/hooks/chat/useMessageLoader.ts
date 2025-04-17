
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Message } from "../useChatTypes";
import { loadChannelMessages } from "./message-loaders/channelMessageLoader";
import { loadDirectMessages } from "./message-loaders/directMessageLoader";
import { getErrorMessages } from "./message-loaders/errorMessageHelper";

export function useMessageLoader(chatType: 'general' | 'direct', recipientId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    
    async function fetchMessages() {
      setLoading(true);
      try {
        let loadedMessages: Message[] = [];
        
        if (chatType === 'general') {
          loadedMessages = await loadChannelMessages(user, setIsOffline);
        } else if (chatType === 'direct' && recipientId) {
          loadedMessages = await loadDirectMessages(user, recipientId, setIsOffline);
        }
        
        if (isMounted) {
          setMessages(loadedMessages);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) {
          setIsOffline(true);
          setMessages(getErrorMessages());
          setLoading(false);
        }
      }
    }
    
    fetchMessages();
    
    return () => {
      isMounted = false;
    };
  }, [user, chatType, recipientId]);

  return { messages, setMessages, loading, isOffline };
}
