import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
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

export const useRoleManagement = () => {
  const { user, deleteUser } = useUser();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

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

  const handleEditRole = (userId: string) => {
    setEditingUserId(userId);
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setSelectedRole(userToEdit.role);
      setSelectedSecondaryRoles(userToEdit.secondaryRoles || []);
    }
  };
  
  const handleSaveRole = async (userId: string) => {
    // Validate selection for Super Admin
    if (selectedRole === "superadmin" && selectedSecondaryRoles.length === 0) {
      toast.error("Super Admin requires at least one secondary role", {
        description: "Please select at least one additional role"
      });
      return;
    }

    try {
      // Regular users cannot have secondary roles
      const updatedSecondaryRoles = selectedRole === "superadmin" ? selectedSecondaryRoles : undefined;
      
      // Update in Supabase if online
      if (navigator.onLine) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: selectedRole,
            secondary_roles: updatedSecondaryRoles
          })
          .eq('id', userId);
          
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        role: selectedRole,
        secondaryRoles: updatedSecondaryRoles
      } : u));
      
      // Update localStorage for offline access
      localStorage.setItem("users", JSON.stringify(
        users.map(u => u.id === userId ? {
          ...u,
          role: selectedRole,
          secondaryRoles: updatedSecondaryRoles
        } : u)
      ));
      
      setEditingUserId(null);
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedSecondaryRoles([]);
  };
  
  const toggleSecondaryRole = (role: UserRole) => {
    setSelectedSecondaryRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };
  
  const handleEditPermissions = (user: User) => {
    return user;
  };
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const result = await deleteUser(userToDelete.id);
      if (result) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  const toggleExpandUser = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return {
    users,
    isLoading,
    editingUserId,
    selectedRole,
    selectedSecondaryRoles,
    userToDelete,
    isDeleting,
    expandedUsers,
    setUserToDelete,
    handleEditRole,
    handleSaveRole,
    handleCancelEdit,
    toggleSecondaryRole,
    handleEditPermissions,
    handleDeleteConfirm,
    toggleExpandUser
  };
};
