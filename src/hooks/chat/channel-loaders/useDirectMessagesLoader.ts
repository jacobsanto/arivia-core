
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { DirectMessage } from "@/components/chat/ChatSidebar";
import { toast } from "sonner";

export function useDirectMessagesLoader(isConnected: boolean, getUserStatus: (userId: string) => "online" | "offline" | "away") {
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const { user } = useUser();

  useEffect(() => {
    async function loadUsers() {
      if (!user || !isConnected) {
        setDirectMessages([]);
        return;
      }
      
      try {
        // Improved user profile loading with better error handling
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .neq('id', user.id) // Don't include current user
          .limit(100); // Add limit for better performance
        
        if (profilesError) {
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
        
        setDirectMessages(userProfiles);
      } catch (error) {
        console.error("Failed to load user profiles:", error);
        
        // Improved error handling - show toast but don't crash
        toast.error("Failed to load user profiles", {
          description: "Direct messaging functionality may be limited"
        });
        
        // Set empty direct messages list instead of failing
        setDirectMessages([]);
      }
    }
    
    loadUsers();
  }, [user, isConnected, getUserStatus]);

  return { directMessages };
}
