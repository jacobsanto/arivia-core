
import { User, UserRole, OFFLINE_CAPABILITIES } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";

// Get all offline capabilities for current user
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

// Check if user has a specific offline capability
export const hasOfflineAccess = (user: User | null, capability: string): boolean => {
  if (!user) return false;
  
  // Superadmin has access to all offline capabilities
  if (user.role === 'superadmin') return true;
  
  const capabilities = getUserOfflineCapabilities(user);
  return capabilities.includes(capability);
};

// Check if offline login is still valid (within 7 days)
export const checkOfflineLoginStatus = (
  user: User | null, 
  lastAuthTime: number, 
  isOffline: boolean
): boolean => {
  if (!user || !lastAuthTime) return false;
  
  // If online, always allow access
  if (!isOffline) return true;
  
  // If offline, check if authentication is expired (7 days)
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  // If more than 7 days since last auth, session is expired
  if (now - lastAuthTime > sevenDaysMs) {
    // Show a toast warning
    toastService.warning("Offline session expired", {
      description: "Please go online to re-authenticate."
    });
    return false;
  }
  
  return true;
};
