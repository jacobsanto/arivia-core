/**
 * Auth module barrel export
 * Provides clean, centralized imports for all authentication-related functionality
 */

// Context and Provider
export { AuthProvider } from './contexts/AuthProvider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useProfile } from './hooks/useProfile';
export { usePermissions } from './hooks/usePermissions';

// Services
export { authService } from './services/authService';
export { profileService } from './services/profileService';
export { permissionService } from './services/permissionService';

// Types
export type {
  User,
  Session,
  UserRole,
  AuthState,
  AuthOperations,
  ProfileOperations,
  PermissionOperations,
  AuthContextType,
  FeaturePermission,
  RoleDetails,
  StateSetter,
  UserStateSetter,
} from './types';

export {
  ROLE_HIERARCHY,
  ROLE_DETAILS,
} from './types';

// Legacy compatibility exports (for gradual migration)
export { useAuth as useUser } from './hooks/useAuth';