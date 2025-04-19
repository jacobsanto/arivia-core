
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { DirectMessage } from "@/components/chat/ChatSidebar";
import { toast } from "sonner";
import { offlineManager } from "@/utils/offlineManager";

export function useDirectMessagesLoader(isConnected: boolean, getUserStatus: (userId: string) => "online" | "offline" | "away") {
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useUser();
  const MAX_RETRIES = 3;

  useEffect(() => {
    async function loadUsers() {
      if (!user) {
        setDirectMessages([]);
        return;
      }
      
      // If offline, try to load cached data
      if (!isConnected) {
        const cachedData = localStorage.getItem('cached_direct_messages');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setDirectMessages(parsedData);
          return;
        }
      }
      
      try {
        // Improved user profile loading with better error handling
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .neq('id', user.id) // Don't include current user
          .limit(100); // Add limit for better performance
        
        if (profilesError) {
          // Check for specific error types
          if (profilesError.code === 'PGRST116') {
            throw new Error("User profile not found. Please contact admin.");
          } else if (profilesError.code === '406') {
            throw new Error("Invalid request format. Please try again.");
          }
          throw profilesError;
        }
        
        // Gracefully handle no users scenario
        if (!profiles || profiles.length === 0) {
          console.log("No other users found in the system");
          setDirectMessages([]);
          return;
        }
        
        // Get unread counts for direct messages
        let unreadCounts: Record<string, number> = {};
        try {
          unreadCounts = await chatService.getUnreadMessageCounts(user.id);
        } catch (error) {
          console.warn("Failed to get unread counts:", error);
          // Continue without unread counts
        }
        
        const userProfiles: DirectMessage[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unknown User',
          avatar: profile.avatar || '/placeholder.svg',
          status: getUserStatus(profile.id),
          unreadCount: unreadCounts[profile.id] || 0
        }));
        
        // Cache the profiles for offline use
        localStorage.setItem('cached_direct_messages', JSON.stringify(userProfiles));
        
        setDirectMessages(userProfiles);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error("Failed to load user profiles:", error);
        
        // Implement exponential backoff for retries
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
          
          toast.error(`Retrying to load profiles (${retryCount + 1}/${MAX_RETRIES})`, {
            description: "Please wait..."
          });
        } else {
          // After max retries, show error and try to use cached data
          toast.error("Failed to load user profiles", {
            description: "Direct messaging functionality may be limited. Using cached data if available."
          });
          
          // Try to load cached data as fallback
          const cachedData = localStorage.getItem('cached_direct_messages');
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            setDirectMessages(parsedData);
          } else {
            setDirectMessages([]);
          }
        }
      }
    }
    
    loadUsers();
  }, [user, isConnected, getUserStatus, retryCount]);

  return { directMessages };
}
