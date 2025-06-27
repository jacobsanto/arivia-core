
import { useUser } from "@/contexts/UserContext";

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    
    // Basic role-based access control
    switch (user.role) {
      case 'superadmin':
        return true;
      case 'tenant_admin':
        return !feature.includes('manage_tenants');
      case 'property_manager':
        return ['manage_properties', 'assign_tasks', 'view_reports'].includes(feature);
      default:
        return false;
    }
  };

  return { canAccess };
};
