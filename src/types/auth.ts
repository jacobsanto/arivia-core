
// This file is deprecated and should be imported from the auth directory instead
// Import from @/types/auth instead of directly from this file

// Re-export all types from the new structure for backwards compatibility
import {
  User,
  Session,
  UserRole,
  UserStateSetter,
  StateSetter,
  FEATURE_PERMISSIONS,
  ROLE_DETAILS,
  OFFLINE_CAPABILITIES,
  hasPermissionWithAllRoles,
  getAllPermissionKeys,
  getDefaultPermissionsForRole
} from './auth';

export type {
  User,
  Session,
  UserRole,
  UserStateSetter,
  StateSetter
};

export {
  FEATURE_PERMISSIONS,
  ROLE_DETAILS,
  OFFLINE_CAPABILITIES,
  hasPermissionWithAllRoles,
  getAllPermissionKeys,
  getDefaultPermissionsForRole
};
