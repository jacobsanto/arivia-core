
import { UserRole } from "@/types/auth";

export const canEditOrderStatus = (userRole: UserRole, orderStatus: string): boolean => {
  // Superadmin and tenant admin can edit any order
  if (userRole === 'superadmin' || userRole === 'tenant_admin') {
    return true;
  }
  
  // Property managers can edit pending and in-progress orders
  if (userRole === 'property_manager') {
    return ['pending', 'in_progress'].includes(orderStatus);
  }
  
  // Inventory managers can edit pending orders
  if (userRole === 'inventory_manager') {
    return orderStatus === 'pending';
  }
  
  return false;
};

export const canViewOrderDetails = (userRole: UserRole): boolean => {
  const authorizedRoles: UserRole[] = [
    'superadmin',
    'tenant_admin', 
    'property_manager',
    'inventory_manager'
  ];
  
  return authorizedRoles.includes(userRole);
};

export const getOrderActionsForRole = (userRole: UserRole, orderStatus: string): string[] => {
  const actions: string[] = [];
  
  if (canEditOrderStatus(userRole, orderStatus)) {
    actions.push('edit', 'cancel');
  }
  
  if (canViewOrderDetails(userRole)) {
    actions.push('view');
  }
  
  // Superadmin and tenant admin can delete orders
  if (userRole === 'superadmin' || userRole === 'tenant_admin') {
    actions.push('delete');
  }
  
  return actions;
};
