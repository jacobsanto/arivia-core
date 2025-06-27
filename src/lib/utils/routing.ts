
export const getRoleBasedRoute = (role: string): string => {
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
    default:
      return '/unauthorized';
  }
};

export const getTenantRoute = (tenantId: string, route: string): string => {
  return `/${tenantId}${route}`;
};

export const isAuthorizedRole = (role: string): boolean => {
  const authorizedRoles = [
    'superadmin',
    'tenant_admin', 
    'property_manager',
    'housekeeping_staff',
    'maintenance_staff',
    'inventory_manager',
    'concierge'
  ];
  return authorizedRoles.includes(role);
};
