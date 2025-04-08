
import { User, UserRole, OFFLINE_CAPABILITIES } from "@/types/auth";

/**
 * Get offline capabilities for a user
 */
export const getUserOfflineCapabilities = (user: User | null): string[] => {
  if (!user) return [];
  
  let capabilities = OFFLINE_CAPABILITIES[user.role] || [];
  
  // If user has secondary roles, add those capabilities
  if (user.secondaryRoles && user.secondaryRoles.length > 0) {
    user.secondaryRoles.forEach(role => {
      const roleCapabilities = OFFLINE_CAPABILITIES[role] || [];
      capabilities = [...capabilities, ...roleCapabilities];
    });
    
    // Remove duplicates
    capabilities = Array.from(new Set(capabilities));
  }
  
  return capabilities;
};

/**
 * Check if user has access to a specific offline capability
 */
export const hasOfflineAccess = (user: User | null, capability: string): boolean => {
  if (!user) return false;
  
  // Superadmin has access to all offline capabilities
  if (user.role === 'superadmin') return true;
  
  const capabilities = getUserOfflineCapabilities(user);
  return capabilities.includes(capability);
};

/**
 * Check if user can still log in when offline
 * 
 * Rules:
 * - Must have authenticated in the last 7 days
 * - Must have offline access privileges
 */
export const checkOfflineLoginStatus = (
  user: User | null, 
  lastAuthTime: number, 
  isOffline: boolean
): boolean => {
  if (!user || !isOffline) return false;
  
  // Check if last authentication was within 7 days
  const sevenDaysMillis = 7 * 24 * 60 * 60 * 1000;
  const isRecentlyAuthenticated = Date.now() - lastAuthTime < sevenDaysMillis;
  
  if (!isRecentlyAuthenticated) return false;
  
  // Check if user role has offline capabilities
  const offlineCapabilities = getUserOfflineCapabilities(user);
  
  return offlineCapabilities.length > 0;
};
