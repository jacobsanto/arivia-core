
import { UserRole } from './base';

export const OFFLINE_CAPABILITIES: Record<UserRole, string[]> = {
  superadmin: [
    'offline_login',
    'offline_task_management',
    'offline_inventory_updates',
    'offline_maintenance_logs',
    'offline_data_sync'
  ],
  tenant_admin: [
    'offline_login',
    'offline_task_management', 
    'offline_inventory_updates',
    'offline_maintenance_logs'
  ],
  property_manager: [
    'offline_login',
    'offline_task_management',
    'offline_inventory_updates'
  ],
  concierge: [
    'offline_login',
    'offline_communication_logs'
  ],
  housekeeping_staff: [
    'offline_login',
    'offline_task_updates',
    'offline_inventory_checks'
  ],
  maintenance_staff: [
    'offline_login', 
    'offline_task_updates',
    'offline_maintenance_logs'
  ],
  inventory_manager: [
    'offline_login',
    'offline_inventory_updates',
    'offline_stock_counts'
  ]
};
