
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { 
  checkFeatureAccess, 
  checkRolePermission
} from "@/services/auth/permissionService";

export const hasPermission = (user: User | null, roles: UserRole[]) => {
  return checkRolePermission(user, roles);
};

export const hasFeatureAccess = (user: User | null, featureKey: string) => {
  return checkFeatureAccess(user, featureKey);
};

export const updatePermissions = (
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
    return;
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
  }
  
  toastService.success("Permissions updated", {
    description: "User permissions have been updated successfully"
  });
};
