/**
 * Permission service - handles permission checking and management
 */
import { User, UserRole, ROLE_HIERARCHY } from "../types";
import { logger } from "@/services/logger";

// Feature permissions mapping
export const FEATURE_PERMISSIONS: Record<string, { allowedRoles: UserRole[] }> = {
  user_management: {
    allowedRoles: ['superadmin', 'administrator']
  },
  system_settings: {
    allowedRoles: ['superadmin', 'administrator']
  },
  property_management: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager']
  },
  task_management: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager']
  },
  inventory_management: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'inventory_manager']
  },
  inventory_access: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager']
  },
  reports: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager']
  },
  guest_services: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'concierge']
  },
  maintenance_tasks: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'maintenance_staff']
  },
  cleaning_tasks: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'housekeeper']
  },
  pool_maintenance: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager', 'pool_service']
  },
  analytics: {
    allowedRoles: ['superadmin', 'administrator', 'property_manager']
  }
};

export class PermissionService {
  /**
   * Check if a user has permission for specific roles
   */
  checkRolePermission(user: User | null, roles: UserRole[]): boolean {
    if (!user) {
      logger.debug('PermissionService', 'No user provided for role check');
      return false;
    }
    
    // Superadmin has all permissions
    if (user.role === "superadmin") {
      logger.debug('PermissionService', 'Superadmin access granted', { userId: user.id });
      return true;
    }
    
    // Check if user's primary role is in the list
    if (roles.includes(user.role)) {
      logger.debug('PermissionService', 'Primary role access granted', { 
        userId: user.id, 
        role: user.role,
        requiredRoles: roles 
      });
      return true;
    }
    
    // Check if any of the user's secondary roles are in the list
    if (user.secondaryRoles && user.secondaryRoles.length > 0) {
      const hasSecondaryRole = user.secondaryRoles.some(role => roles.includes(role));
      if (hasSecondaryRole) {
        logger.debug('PermissionService', 'Secondary role access granted', { 
          userId: user.id, 
          secondaryRoles: user.secondaryRoles,
          requiredRoles: roles 
        });
        return true;
      }
    }
    
    logger.debug('PermissionService', 'Role access denied', { 
      userId: user.id, 
      userRole: user.role,
      secondaryRoles: user.secondaryRoles,
      requiredRoles: roles 
    });
    return false;
  }

  /**
   * Check if a user has access to a specific feature
   */
  checkFeatureAccess(user: User | null, featureKey: string): boolean {
    if (!user) {
      logger.debug('PermissionService', 'No user provided for feature check', { featureKey });
      return false;
    }
    
    // Superadmin always has access to everything
    if (user.role === "superadmin") {
      logger.debug('PermissionService', 'Superadmin feature access granted', { 
        userId: user.id, 
        featureKey 
      });
      return true;
    }
    
    // Check custom permissions first if they exist
    if (user.customPermissions && user.customPermissions[featureKey] !== undefined) {
      const hasCustomPermission = user.customPermissions[featureKey];
      logger.debug('PermissionService', 'Custom permission check', { 
        userId: user.id, 
        featureKey,
        hasPermission: hasCustomPermission 
      });
      return hasCustomPermission;
    }
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) {
      logger.warn('PermissionService', 'Unknown feature key', { featureKey });
      return false;
    }
    
    // Use role permission check
    const hasAccess = this.checkRolePermission(user, permission.allowedRoles);
    logger.debug('PermissionService', 'Feature access check result', { 
      userId: user.id, 
      featureKey,
      hasAccess,
      allowedRoles: permission.allowedRoles 
    });
    
    return hasAccess;
  }

  /**
   * Check if user role has higher hierarchy than target role
   */
  hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
    const userHierarchy = ROLE_HIERARCHY[userRole] || 0;
    const targetHierarchy = ROLE_HIERARCHY[targetRole] || 0;
    
    const hasHigher = userHierarchy > targetHierarchy;
    logger.debug('PermissionService', 'Role hierarchy check', { 
      userRole, 
      targetRole, 
      userHierarchy, 
      targetHierarchy, 
      hasHigher 
    });
    
    return hasHigher;
  }

  /**
   * Get all available features for a user
   */
  getUserFeatures(user: User | null): string[] {
    if (!user) return [];
    
    const features = Object.keys(FEATURE_PERMISSIONS).filter(featureKey => 
      this.checkFeatureAccess(user, featureKey)
    );
    
    logger.debug('PermissionService', 'User features calculated', { 
      userId: user.id, 
      featureCount: features.length,
      features 
    });
    
    return features;
  }

  /**
   * Check if user can manage another user (based on role hierarchy)
   */
  canManageUser(currentUser: User | null, targetUser: User): boolean {
    if (!currentUser) return false;
    
    // Superadmin can manage anyone
    if (currentUser.role === 'superadmin') return true;
    
    // Admin can manage non-superadmin users
    if (currentUser.role === 'administrator' && targetUser.role !== 'superadmin') {
      return true;
    }
    
    // Property managers can manage staff roles
    if (currentUser.role === 'property_manager') {
      const staffRoles: UserRole[] = ['housekeeping_staff', 'maintenance_staff', 'housekeeper', 'pool_service', 'external_partner'];
      return staffRoles.includes(targetUser.role);
    }
    
    return false;
  }

  /**
   * Get offline login status (mock implementation for compatibility)
   */
  getOfflineLoginStatus(): boolean {
    // This could be enhanced to check localStorage or other offline indicators
    logger.debug('PermissionService', 'Checking offline login status');
    return false;
  }
}

// Export singleton instance
export const permissionService = new PermissionService();