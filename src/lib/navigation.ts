
import { Home, Calendar, ClipboardList, Package, Users, BarChart3, Settings, MessageSquare, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/auth/base';

export interface NavigationItem {
  title: string;
  path: string;
  icon: any;
  permission: string;
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    permission: 'viewDashboard',
    description: 'Overview and key metrics'
  },
  {
    title: 'Calendar',
    path: '/calendar',
    icon: Calendar,
    permission: 'viewProperties',
    description: 'Booking calendar and availability'
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: ClipboardList,
    permission: 'viewAssignedTasks',
    description: 'Task management and assignments'
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Package,
    permission: 'viewInventory',
    description: 'Stock levels and supplies'
  },
  {
    title: 'Team Chat',
    path: '/chat',
    icon: MessageSquare,
    permission: 'viewChat',
    description: 'Team communication'
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: BarChart3,
    permission: 'viewReports',
    description: 'Analytics and reporting'
  },
  {
    title: 'Damage Reports',
    path: '/damage-reports',
    icon: AlertTriangle,
    permission: 'view_damage_reports',
    description: 'Property damage tracking'
  },
  {
    title: 'Team',
    path: '/team',
    icon: Users,
    permission: 'viewUsers',
    description: 'User management'
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    permission: 'manageSettings',
    description: 'System configuration'
  }
];

export const getRoleBasedNavigation = (userRole: UserRole): NavigationItem[] => {
  // Filter navigation based on role permissions
  const rolePermissions: Record<UserRole, string[]> = {
    superadmin: ['viewDashboard', 'viewProperties', 'viewAllTasks', 'viewInventory', 'viewChat', 'viewReports', 'view_damage_reports', 'viewUsers', 'manageSettings'],
    tenant_admin: ['viewDashboard', 'viewProperties', 'viewAllTasks', 'viewInventory', 'viewChat', 'viewReports', 'view_damage_reports', 'viewUsers'],
    property_manager: ['viewDashboard', 'viewProperties', 'viewAllTasks', 'viewInventory', 'viewChat', 'viewReports'],
    housekeeping_staff: ['viewDashboard', 'viewAssignedTasks', 'viewInventory', 'viewChat'],
    maintenance_staff: ['viewDashboard', 'viewAssignedTasks', 'viewInventory', 'viewChat'],
    inventory_manager: ['viewDashboard', 'viewInventory', 'viewReports', 'viewChat'],
    concierge: ['viewDashboard', 'viewProperties', 'viewAssignedTasks', 'viewChat']
  };

  const allowedPermissions = rolePermissions[userRole] || [];
  return navigationItems.filter(item => allowedPermissions.includes(item.permission));
};
