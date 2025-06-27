
export const getRoleBasedRoute = (role: string): string => {
  switch (role) {
    case 'superadmin':
    case 'tenant_admin':
      return '/admin';
    case 'property_manager':
      return '/manager';
    case 'housekeeping_staff':
      return '/cleaner';
    case 'guest':
      return '/guest';
    default:
      return '/dashboard';
  }
};

export const getTenantRoute = (tenantId: string, route: string): string => {
  return `/${tenantId}${route}`;
};
