
import { UserRole } from "@/types/auth";

// Define which roles are authorized for internal access
const AUTHORIZED_ROLES: UserRole[] = [
  'superadmin',
  'tenant_admin', 
  'property_manager',
  'housekeeping_staff',
  'maintenance_staff',
  'inventory_manager',
  'concierge'
];

export const isAuthorizedRole = (role: UserRole): boolean => {
  return AUTHORIZED_ROLES.includes(role);
};

export const getRoleBasedRoute = (role: UserRole): string => {
  switch (role) {
    case 'superadmin':
    case 'tenant_admin':
      return '/admin';
    case 'property_manager':
      return '/manager';
    case 'housekeeping_staff':
      return '/cleaner';
    case 'maintenance_staff':
      return '/maintenance';
    case 'inventory_manager':
      return '/admin'; // Inventory managers go to admin dashboard
    case 'concierge':
      return '/staff/tasks';
    default:
      return '/internal/login';
  }
};

export const getNavigationItems = (role: UserRole) => {
  const baseItems = [
    { label: 'Dashboard', path: getRoleBasedRoute(role) }
  ];
  
  switch (role) {
    case 'superadmin':
    case 'tenant_admin':
      return [
        ...baseItems,
        { label: 'Bookings', path: '/admin/bookings' },
        { label: 'Tasks', path: '/admin/tasks' },
        { label: 'Properties', path: '/properties' },
        { label: 'Reports', path: '/reports' }
      ];
    
    case 'property_manager':
      return [
        ...baseItems,
        { label: 'Tasks', path: '/admin/tasks' },
        { label: 'Properties', path: '/properties' }
      ];
    
    case 'housekeeping_staff':
    case 'maintenance_staff':
    case 'concierge':
      return [
        ...baseItems,
        { label: 'My Tasks', path: '/staff/tasks' }
      ];
    
    default:
      return baseItems;
  }
};
