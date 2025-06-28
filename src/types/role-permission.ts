
export interface Role {
  id: string;
  name: string;
  tenant_id: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  key: string;
  label: string;
  description?: string;
  category: string;
  tenant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  tenant_id: string;
  created_at: string;
}

export interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}
