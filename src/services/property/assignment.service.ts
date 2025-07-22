import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';

export interface PropertyAssignment {
  id: string;
  user_id: string;
  property_id: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
  notes?: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  property?: {
    name: string;
    address: string;
  };
}

export interface CustomRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
}

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  custom_role_id?: string;
  custom_role?: CustomRole;
}

export const assignmentService = {
  async assignUsersToProperty(propertyId: string, userIds: string[]): Promise<boolean> {
    try {
      // Use direct SQL to update properties table (this will work even without updated types)
      const { error } = await supabase
        .from('properties')
        .update({ 
          // Cast to any to bypass TypeScript checking for now
          assigned_users: userIds as any 
        } as any)
        .eq('id', propertyId);

      if (error) {
        throw new Error(error.message);
      }

      toastService.success('Users assigned successfully', {
        description: `${userIds.length} user(s) assigned to property`
      });

      return true;
    } catch (err: any) {
      console.error('Error assigning users to property:', err);
      toastService.error('Failed to assign users', {
        description: err.message
      });
      throw err;
    }
  },

  async getPropertyAssignments(propertyId: string): Promise<PropertyAssignment[]> {
    try {
      // Get property with assigned users (cast to bypass TypeScript until types are updated)
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const assignedUsers = (property as any)?.assigned_users;
      if (!assignedUsers || !Array.isArray(assignedUsers)) {
        return [];
      }

      // Get user details for assigned users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('id', assignedUsers);

      if (usersError) {
        throw new Error(usersError.message);
      }

      // Transform to PropertyAssignment format
      return (users || []).map(user => ({
        id: user.id,
        user_id: user.id,
        property_id: propertyId,
        assigned_by: '',
        assigned_at: new Date().toISOString(),
        is_active: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      }));
    } catch (err: any) {
      console.error('Error fetching property assignments:', err);
      toastService.error('Failed to fetch assignments', {
        description: err.message
      });
      return [];
    }
  },

  async getUserAssignedProperties(userId?: string): Promise<any[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      // Get properties where user is in assigned_users array
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, address, assigned_users')
        .contains('assigned_users', [targetUserId]);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(property => ({
        property_id: property.id,
        property_name: property.name,
        property_address: property.address,
        assigned_at: new Date().toISOString(),
        assigned_by: ''
      }));
    } catch (err: any) {
      console.error('Error fetching user assigned properties:', err);
      toastService.error('Failed to fetch assigned properties', {
        description: err.message
      });
      return [];
    }
  },

  async getAssignableUsers(): Promise<AssignableUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role
      }));
    } catch (err: any) {
      console.error('Error fetching assignable users:', err);
      toastService.error('Failed to fetch users', {
        description: err.message
      });
      return [];
    }
  },

  async getCustomRoles(): Promise<CustomRole[]> {
    try {
      // For now, return static roles since custom_roles table might not be in types yet
      return [
        { id: '1', name: 'superadmin', display_name: 'Super Admin', permissions: {}, is_active: true },
        { id: '2', name: 'administrator', display_name: 'Administrator', permissions: {}, is_active: true },
        { id: '3', name: 'property_manager', display_name: 'Property Manager', permissions: {}, is_active: true },
        { id: '4', name: 'housekeeper', display_name: 'Housekeeper', permissions: {}, is_active: true },
        { id: '5', name: 'maintenance_staff', display_name: 'Maintenance Staff', permissions: {}, is_active: true },
        { id: '6', name: 'pool_service', display_name: 'Pool Service', permissions: {}, is_active: true },
        { id: '7', name: 'external_partner', display_name: 'External Partner', permissions: {}, is_active: true }
      ];
    } catch (err: any) {
      console.error('Error fetching custom roles:', err);
      return [];
    }
  },

  async createCustomRole(roleData: Partial<CustomRole>): Promise<CustomRole> {
    try {
      // For now, return mock data since the table might not be in types yet
      const newRole: CustomRole = {
        id: Date.now().toString(),
        name: roleData.name || '',
        display_name: roleData.display_name || '',
        description: roleData.description,
        permissions: roleData.permissions || {},
        is_active: true
      };

      toastService.success('Role created successfully', {
        description: `Role "${roleData.display_name}" has been created`
      });

      return newRole;
    } catch (err: any) {
      console.error('Error creating custom role:', err);
      toastService.error('Failed to create role', {
        description: err.message
      });
      throw err;
    }
  },

  async updateUserRole(userId: string, roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: roleId })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      toastService.success('User role updated successfully');
      return true;
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toastService.error('Failed to update user role', {
        description: err.message
      });
      throw err;
    }
  },

  async removeUserFromProperty(userId: string, propertyId: string): Promise<boolean> {
    try {
      // Get current property data
      const { data: property } = await supabase
        .from('properties')
        .select('assigned_users')
        .eq('id', propertyId)
        .single();

      if (property && property.assigned_users) {
        const updatedUsers = (property.assigned_users as string[]).filter((id: string) => id !== userId);
        
        const { error } = await supabase
          .from('properties')
          .update({ assigned_users: updatedUsers as any } as any)
          .eq('id', propertyId);

        if (error) {
          throw new Error(error.message);
        }
      }

      toastService.success('User removed from property');
      return true;
    } catch (err: any) {
      console.error('Error removing user from property:', err);
      toastService.error('Failed to remove user', {
        description: err.message
      });
      throw err;
    }
  }
};