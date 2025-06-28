
import { User, UserRole, FEATURE_PERMISSIONS } from "@/types/auth";

/**
 * Check if a user has permission for specific roles
 */
export const checkRolePermission = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  
  // Superadmin has all permissions
  if (user.role === "superadmin") return true;
  
  // Check if user's primary role is in the list
  if (roles.includes(user.role)) {
    return true;
  }
  
  // Check if any of the user's secondary roles are in the list
  if (user.secondaryRoles && user.secondaryRoles.length > 0) {
    return user.secondaryRoles.some(role => roles.includes(role));
  }
  
  return false;
};

/**
 * Check if a user has access to a specific feature
 */
export const checkFeatureAccess = (user: User | null, featureKey: string): boolean => {
  if (!user) return false;
  
  // Superadmin always has access to everything
  if (user.role === "superadmin") return true;
  
  // Check custom permissions first if they exist
  if (user.customPermissions && user.customPermissions[featureKey] !== undefined) {
    return user.customPermissions[featureKey];
  }
  
  // Check if feature exists in permissions
  const permission = FEATURE_PERMISSIONS[featureKey];
  if (!permission) return false;
  
  // Check if user's role is in the allowed roles
  if (permission.allowedRoles.includes(user.role)) {
    return true;
  }
  
  // Check if any of the user's secondary roles are allowed
  if (user.secondaryRoles && user.secondaryRoles.length > 0) {
    return user.secondaryRoles.some(role => permission.allowedRoles.includes(role));
  }
  
  return false;
};

/**
 * Update custom permissions for a user
 */
export const updatePermissions = (
  users: User[],
  userId: string,
  permissions: Record<string, boolean>
): User[] => {
  return users.map(user => {
    if (user.id === userId) {
      return {
        ...user,
        customPermissions: permissions
      };
    }
    return user;
  });
};
