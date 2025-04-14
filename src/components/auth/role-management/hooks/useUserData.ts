
import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        if (navigator.onLine) {
          console.log("Fetching users from Supabase...");
          // Fetch profiles from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data) {
            console.log(`Fetched ${data.length} users successfully`, data);
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
            console.log("Updated localStorage with fetched users");
          }
        } else {
          console.log("Device is offline, using localStorage or mock data");
          // Offline mode - use localStorage
          const storedUsers = localStorage.getItem("users");
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
            console.log("Loaded users from localStorage");
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users", {
          description: "Using cached data instead"
        });
        
        // Use localStorage data as fallback
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
          console.log("Loaded users from localStorage after error");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    
    // Set up real-time subscription for profile changes
    const profilesChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profile change detected:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          const newProfile = payload.new;
          // Add the new user to the list
          setUsers(prevUsers => [
            ...prevUsers,
            {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name || newProfile.email.split('@')[0],
              role: newProfile.role as UserRole,
              secondaryRoles: newProfile.secondary_roles,
              avatar: newProfile.avatar || "/placeholder.svg",
              customPermissions: newProfile.custom_permissions
            }
          ]);
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedProfile = payload.new;
          // Update the existing user
          setUsers(prevUsers => 
            prevUsers.map(user => 
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
            )
          );
        }
        else if (payload.eventType === 'DELETE') {
          // Remove the deleted user
          setUsers(prevUsers => 
            prevUsers.filter(user => user.id !== payload.old.id)
          );
        }
        
        // Update localStorage
        localStorage.setItem("users", JSON.stringify(
          setUsers(prevState => {
            localStorage.setItem("users", JSON.stringify(prevState));
            return prevState;
          })
        ));
      })
      .subscribe((status) => {
        console.log(`Profile subscription status: ${status}`);
      });
    
    return () => {
      console.log("Cleaning up profile subscription");
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  return {
    users,
    isLoading,
    setUsers
  };
};
