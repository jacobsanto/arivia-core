
import { User, UserRole, FEATURE_PERMISSIONS, hasPermissionWithAllRoles } from "@/types/auth";

// Check if user has access to a specific feature
export const checkFeatureAccess = (
  user: User | null, 
  featureKey: string
): boolean => {
  if (!user) return false;
  
  // Superadmin has access to everything
  if (user.role === "superadmin") return true;
  
  // Check custom permissions first
  if (user.customPermissions && user.customPermissions[featureKey] !== undefined) {
    return user.customPermissions[featureKey];
  }
  
  // Check if feature exists in permissions
  const permission = FEATURE_PERMISSIONS[featureKey];
  if (!permission) return false;
  
  // Fall back to role-based permissions
  return hasPermissionWithAllRoles(user.role, user.secondaryRoles, permission.allowedRoles);
};

// Check if user has role-based permission
export const checkRolePermission = (
  user: User | null, 
  roles: UserRole[]
): boolean => {
  if (!user) return false;
  
  // Superadmin has access to everything
  if (user.role === "superadmin") return true;
  
  // Check if user role is in the allowed roles
  return roles.includes(user.role);
};

// Update permissions for a specific user
export const updatePermissions = (
  users: User[], 
  userId: string, 
  permissions: Record<string, boolean>
): User[] => {
  return users.map(u => {
    if (u.id === userId) {
      return {
        ...u,
        customPermissions: permissions
      };
    }
    return u;
  });
};
