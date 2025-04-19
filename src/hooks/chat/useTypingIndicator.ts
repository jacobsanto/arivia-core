
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

export const useTypingIndicator = (channelId?: string) => {
  const [typingStatus, setTypingStatus] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useUser();
  
  useEffect(() => {
    let typingChannel: any = null;
    
    if (channelId && user) {
      // Subscribe to typing indicators
      typingChannel = supabase.channel(`typing:${channelId}`)
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.userId !== user.id) {
            setTypingStatus(`${payload.payload.userName} is typing...`);
            
            // Clear typing status after 3 seconds of no typing updates
            const timeout = setTimeout(() => {
              setTypingStatus("");
            }, 3000);

            // Clear previous timeout if exists
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = timeout;
          }
        })
        .subscribe();
    }
    
    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel);
      }
      
      // Clear timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [channelId, user]);
  
  const handleTyping = () => {
    if (!channelId || !user) return;
    
    // Send typing indicator
    const channel = supabase.channel(`typing:${channelId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, userName: user.name || 'Anonymous' }
    });
  };
  
  const clearTyping = () => {
    setTypingStatus("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };
  
  return { typingStatus, handleTyping, clearTyping };
};
