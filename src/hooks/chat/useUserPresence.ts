
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserStatus {
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export const useUserPresence = () => {
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Set up presence channel
    const presenceChannel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        
        // Transform to our format
        const formattedState: Record<string, UserStatus> = {};
        Object.entries(newState).forEach(([key, presences]) => {
          const presence = presences[0] as any;
          formattedState[key] = {
            userId: presence.userId,
            status: presence.status,
            lastSeen: presence.lastSeen
          };
        });
        
        setUserStatuses(formattedState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0] as any;
        setUserStatuses(prev => ({
          ...prev,
          [key]: {
            userId: presence.userId,
            status: presence.status,
            lastSeen: presence.lastSeen
          }
        }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setUserStatuses(prev => {
          const newState = { ...prev };
          if (prev[key]) {
            newState[key] = { ...prev[key], status: 'offline', lastSeen: new Date().toISOString() };
          }
          return newState;
        });
      })
      .subscribe();
    
    // Track own presence
    const updatePresence = async () => {
      await presenceChannel.track({
        userId: user.id,
        status: 'online',
        lastSeen: new Date().toISOString()
      });
    };
    
    updatePresence();
    
    // Update presence every 5 minutes
    const interval = setInterval(updatePresence, 5 * 60 * 1000);
    
    // Set up window focus/blur events to track away status
    const handleFocus = () => {
      presenceChannel.track({
        userId: user.id,
        status: 'online',
        lastSeen: new Date().toISOString()
      });
    };
    
    const handleBlur = () => {
      presenceChannel.track({
        userId: user.id,
        status: 'away',
        lastSeen: new Date().toISOString()
      });
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);
  
  const getUserStatus = (userId: string): "online" | "offline" | "away" => {
    return userStatuses[userId]?.status || 'offline';
  };
  
  return { userStatuses, getUserStatus };
};
