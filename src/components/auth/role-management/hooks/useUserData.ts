import { useState, useEffect, useRef } from "react";
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/services/logger';

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);

  // Fetch users from Supabase and set up realtime subscription
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        if (navigator.onLine) {
          logger.debug("Fetching users from Supabase...");
          // Fetch profiles from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data) {
            logger.debug(`Fetched ${data.length} users successfully`);
            // Convert to User type
            const mappedUsers: User[] = data.map((profile: any) => ({
              id: profile.id,
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              role: profile.role as UserRole,
              secondaryRoles: profile.secondary_roles ? profile.secondary_roles as UserRole[] : undefined,
              avatar: profile.avatar || "/placeholder.svg",
              customPermissions: profile.custom_permissions
            }));
            
            setUsers(mappedUsers);
            
            // Update localStorage for offline use
            localStorage.setItem("users", JSON.stringify(mappedUsers));
            logger.debug("Updated localStorage with fetched users");
          }
        } else {
          logger.debug("Device is offline, using localStorage data");
          // Offline mode - use localStorage
          const storedUsers = localStorage.getItem("users");
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
            logger.debug("Loaded users from localStorage");
          }
        }
      } catch (error) {
        logger.error("Error fetching users:", error);
        toast.error("Failed to load users", {
          description: "Using cached data instead"
        });
        
        // Use localStorage data as fallback
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
          logger.debug("Loaded users from localStorage after error");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch users initially
    fetchUsers();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('public:profiles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        logger.debug('Profile change detected:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          // Only add if not already in the list (avoid duplicates)
          const newProfile = payload.new;
          setUsers(prevUsers => {
            if (prevUsers.some(user => user.id === newProfile.id)) {
              return prevUsers; // Already exists, no change
            }
            
            // Add new user
            const newUser: User = {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name || newProfile.email.split('@')[0],
              role: newProfile.role as UserRole,
              secondaryRoles: newProfile.secondary_roles,
              avatar: newProfile.avatar || "/placeholder.svg",
              customPermissions: newProfile.custom_permissions
            };
            
            const updatedUsers = [...prevUsers, newUser];
            
            // Update localStorage
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            
            return updatedUsers;
          });
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedProfile = payload.new;
          // Update the existing user
          setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(user => 
              user.id === updatedProfile.id 
                ? {
                    ...user,
                    email: updatedProfile.email,
                    name: updatedProfile.name || updatedProfile.email.split('@')[0],
                    role: updatedProfile.role as UserRole,
                    secondaryRoles: updatedProfile.secondary_roles,
                    avatar: updatedProfile.avatar || "/placeholder.svg",
                    customPermissions: updatedProfile.custom_permissions
                  }
                : user
            );
            
            // Update localStorage
            localStorage.setItem("users", JSON.stringify(updatedUsers));
            
            return updatedUsers;
          });
        }
        else if (payload.eventType === 'DELETE') {
          // Remove the deleted user
          setUsers(prevUsers => {
            const filteredUsers = prevUsers.filter(user => user.id !== payload.old.id);
            
            // Update localStorage
            localStorage.setItem("users", JSON.stringify(filteredUsers));
            
            return filteredUsers;
          });
        }
      })
      .subscribe((status) => {
        logger.debug(`Profile subscription status: ${status}`);
      });
    
    // Store subscription for cleanup
    subscriptionRef.current = channel;
    
    return () => {
      logger.debug("Cleaning up profile subscription");
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    users,
    isLoading,
    setUsers
  };
};
