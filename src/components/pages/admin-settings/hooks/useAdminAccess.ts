/**
 * Hook for checking admin access permissions
 */
import { useMemo } from 'react';
import { User } from '@/types/auth';

export interface AdminAccessState {
  isElevated: boolean;
  isLoading: boolean;
  hasSystemSettings: boolean;
  hasSuperAdmin: boolean;
}

export const useAdminAccess = (user: User | null): AdminAccessState => {
  return useMemo(() => {
    if (!user) {
      return {
        isElevated: false,
        isLoading: false,
        hasSystemSettings: false,
        hasSuperAdmin: false
      };
    }
    
    const isElevated = user.role === "superadmin" || user.role === "administrator";
    const hasSuperAdmin = user.role === "superadmin";
    const hasSystemSettings = isElevated;
    
    return {
      isElevated,
      isLoading: false,
      hasSystemSettings,
      hasSuperAdmin
    };
  }, [user]);
};