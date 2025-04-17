
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

export const useTypingIndicator = (channelId?: string) => {
  const [typingStatus, setTypingStatus] = useState<string>("");
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const { user } = useUser();
  
  useEffect(() => {
    let typingChannel: any;
    
    if (channelId && user) {
      // Subscribe to typing indicators
      typingChannel = supabase.channel(`typing:${channelId}`)
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.userId !== user.id) {
            setTypingStatus(`${payload.payload.userName} is typing...`);
            
            // Clear typing status after 3 seconds of no typing updates
            setTimeout(() => {
              setTypingStatus("");
            }, 3000);
          }
        })
        .subscribe();
    }
    
    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel);
      }
    };
  }, [channelId, user]);
  
  const handleTyping = () => {
    if (!channelId || !user) return;
    
    // Clear existing timeout
    if (typingTimeout) {
      window.clearTimeout(typingTimeout);
    }
    
    // Send typing indicator
    const channel = supabase.channel(`typing:${channelId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, userName: user.name || 'Anonymous' }
    });
    
    // Set timeout to clear typing status
    const timeout = window.setTimeout(() => {
      setTypingTimeout(null);
    }, 2000);
    
    setTypingTimeout(timeout as unknown as number);
  };
  
  const clearTyping = () => {
    if (typingTimeout) {
      window.clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    setTypingStatus("");
  };
  
  return { typingStatus, handleTyping, clearTyping };
};
