
export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  tenant_id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  created_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

export type CreateRoleData = Omit<Role, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRoleData = Partial<CreateRoleData>;
export type CreatePermissionData = Omit<Permission, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePermissionData = Partial<CreatePermissionData>;
