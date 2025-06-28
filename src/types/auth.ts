
// Re-export everything from the base auth types for backward compatibility
export * from './auth/base';
export * from './auth/roles';
export * from './auth/capabilities';

// Export the main types that components expect
export type { User, TenantUser, Session, UserRole, Tenant, TenantSettings } from './auth/base';
export { ROLE_DETAILS, getDefaultPermissionsForRole } from './auth/roles';
export { OFFLINE_CAPABILITIES } from './auth/capabilities';
