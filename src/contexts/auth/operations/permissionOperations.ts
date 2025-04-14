
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { 
  checkFeatureAccess, 
  checkRolePermission
} from "@/services/auth/permissionService";
import { supabase } from "@/integrations/supabase/client";

export const hasPermission = (user: User | null, roles: UserRole[]) => {
  return checkRolePermission(user, roles);
};

export const hasFeatureAccess = (user: User | null, featureKey: string) => {
  return checkFeatureAccess(user, featureKey);
};

export const updatePermissions = async (
  user: User | null, 
  users: User[], 
  setUsers: (users: User[]) => void, 
  setUser: (user: User | null) => void, 
  userId: string, 
  permissions: Record<string, boolean>
) => {
  // Only allow superadmins to modify permissions
  if (user?.role !== "superadmin") {
    toastService.error("Permission denied", {
      description: "Only Super Admins can modify user permissions"
    });
    return false;
  }
  
  try {
    // First, update the database if online - this is now our primary action
    if (navigator.onLine) {
      console.log("Saving permissions to database:", permissions);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          custom_permissions: permissions 
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Error saving permissions to database:", error);
        throw error;
      }
      
      console.log("Permissions saved to database successfully");
    } else {
      console.log("Offline mode - permissions will sync when online");
      toastService.warning("You are offline", {
        description: "Permission changes will sync when you're back online"
      });
    }
    
    // Update permissions in the users array
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          customPermissions: permissions
        };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    
    // If the current user's permissions were updated, update the state
    if (user?.id === userId) {
      setUser({
        ...user,
        customPermissions: permissions
      });
      
      // Update localStorage for offline support
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem("user", JSON.stringify({
          ...parsedUser,
          customPermissions: permissions
        }));
      }
    }
    
    toastService.success("Permissions updated", {
      description: "User permissions have been updated successfully"
    });
    
    return true;
  } catch (error) {
    console.error("Error updating permissions:", error);
    toastService.error("Failed to update permissions", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};
