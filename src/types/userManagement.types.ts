import { AppRole } from './permissions.types';

export interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
  avatar?: string;
  isOnline: boolean;
  openTasksCount: number;
  created_at: string;
  updated_at: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
}

export interface UserFilters {
  searchQuery: string;
  roleFilter: AppRole | 'all';
}

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: 'Super Admin',
  administrator: 'Administrator',
  property_manager: 'Property Manager',
  housekeeping_staff: 'Housekeeping Staff',
  maintenance_staff: 'Maintenance Staff',
  guest: 'Guest'
};

export const ROLE_COLORS: Record<AppRole, string> = {
  superadmin: 'bg-red-100 text-red-800 border-red-200',
  administrator: 'bg-purple-100 text-purple-800 border-purple-200',
  property_manager: 'bg-blue-100 text-blue-800 border-blue-200',
  housekeeping_staff: 'bg-green-100 text-green-800 border-green-200',
  maintenance_staff: 'bg-orange-100 text-orange-800 border-orange-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const STATUS_COLORS = {
  online: 'bg-green-500',
  offline: 'bg-gray-400'
};