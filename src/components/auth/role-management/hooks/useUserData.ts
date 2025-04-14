import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// We'll keep the mock data as fallback
const MOCK_USER_LIST: User[] = [{
  id: "1",
  email: "admin@ariviavillas.com",
  name: "Admin User",
  role: "administrator",
  avatar: "/placeholder.svg"
}, {
  id: "2",
  email: "manager@ariviavillas.com",
  name: "Property Manager",
  role: "property_manager",
  avatar: "/placeholder.svg"
}, {
  id: "3",
  email: "concierge@ariviavillas.com",
  name: "Concierge Staff",
  role: "concierge",
  avatar: "/placeholder.svg"
}, {
  id: "4",
  email: "housekeeping@ariviavillas.com",
  name: "Housekeeping Staff",
  role: "housekeeping_staff",
  avatar: "/placeholder.svg"
}, {
  id: "5",
  email: "maintenance@ariviavillas.com",
  name: "Maintenance Staff",
  role: "maintenance_staff",
  avatar: "/placeholder.svg"
}, {
  id: "6",
  email: "inventory@ariviavillas.com",
  name: "Inventory Manager",
  role: "inventory_manager",
  avatar: "/placeholder.svg"
}, {
  id: "7",
  email: "superadmin@ariviavillas.com",
  name: "Super Admin",
  role: "superadmin",
  secondaryRoles: ["administrator"],
  avatar: "/placeholder.svg"
}];

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        if (navigator.onLine) {
          // Fetch profiles from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data) {
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
          }
        } else {
          // Offline mode - use localStorage
          const storedUsers = localStorage.getItem("users");
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          } else {
            // Fallback to mock data if no stored users
            setUsers(MOCK_USER_LIST);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users", {
          description: "Using cached or mock data instead"
        });
        
        // Use mock data as fallback
        const storedUsers = localStorage.getItem("users");
        setUsers(storedUsers ? JSON.parse(storedUsers) : MOCK_USER_LIST);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    
    // Set up real-time subscription for profile changes
    const profilesSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profile change detected:', payload);
        fetchUsers(); // Reload users when profiles change
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profilesSubscription);
    };
  }, []);

  return {
    users,
    isLoading,
    setUsers
  };
};
