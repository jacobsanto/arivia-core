/**
 * User data service - centralized user operations
 */
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/services/core/api-client";
import { handleError } from "@/services/core/error-handler";
import { logger } from "@/services/logger";
import { User, UserRole } from "@/types/auth";

export interface UserFilters {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  customPermissions?: Record<string, boolean>;
}

class UserService {
  private readonly CACHE_KEY = 'users';
  private readonly CACHE_TTL = 300000; // 5 minutes
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;
      
      const result = await apiClient.query(
        'profiles',
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.session.user.id)
          .single(),
        {
          cache: true,
          cacheKey: `user_${session.session.user.id}`,
          cacheTTL: this.CACHE_TTL
        }
      );
      
      if (result.error) {
        handleError(result.error, { component: 'UserService', action: 'getCurrentUser' });
        return null;
      }
      
      if (!result.data) return null;
      
      const profile = result.data as any;
      return {
        id: profile.user_id,
        email: session.session.user.email || '',
        name: profile.name,
        role: profile.role as UserRole,
        avatar: profile.avatar || "/placeholder.svg",
        phone: profile.phone,
        customPermissions: profile.custom_permissions || {}
      };
      
    } catch (error: any) {
      handleError(error, { component: 'UserService', action: 'getCurrentUser' });
      return null;
    }
  }
  
  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (filters.role) {
        query = query.eq('role', filters.role as any);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      const cacheKey = `${this.CACHE_KEY}_${JSON.stringify(filters)}`;
      
      const result = await apiClient.query(
        'profiles',
        query,
        {
          cache: !filters.search, // Don't cache search results
          cacheKey,
          cacheTTL: this.CACHE_TTL
        }
      );
      
      if (result.error) {
        handleError(result.error, { component: 'UserService', action: 'getUsers' });
        return [];
      }
      
      return ((result.data as any[]) || []).map(this.mapProfileToUser);
      
    } catch (error: any) {
      handleError(error, { component: 'UserService', action: 'getUsers' });
      return [];
    }
  }
  
  async updateUser(userId: string, data: UserUpdateData): Promise<boolean> {
    try {
      const result = await apiClient.mutate(
        async () => {
          return await supabase
            .from('profiles')
            .update(data as any)
            .eq('user_id', userId);
        }
      );
      
      if (result.error) {
        handleError(result.error, { 
          component: 'UserService', 
          action: 'updateUser',
          metadata: { userId, updateFields: Object.keys(data) }
        });
        return false;
      }
      
      // Clear relevant cache
      apiClient.clearCache('user');
      apiClient.clearCache(this.CACHE_KEY);
      
      logger.info('User updated successfully', { userId, fields: Object.keys(data) });
      return true;
      
    } catch (error: any) {
      handleError(error, { component: 'UserService', action: 'updateUser' });
      return false;
    }
  }
  
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await apiClient.mutate(
        () => supabase.auth.admin.deleteUser(userId)
      );
      
      if (result.error) {
        handleError(result.error, { 
          component: 'UserService', 
          action: 'deleteUser',
          metadata: { userId }
        });
        return false;
      }
      
      // Clear cache
      apiClient.clearCache('user');
      apiClient.clearCache(this.CACHE_KEY);
      
      logger.info('User deleted successfully', { userId });
      return true;
      
    } catch (error: any) {
      handleError(error, { component: 'UserService', action: 'deleteUser' });
      return false;
    }
  }
  
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const result = await apiClient.query(
        'profiles',
        supabase
          .from('profiles')
          .select('custom_permissions, role')
          .eq('user_id', userId)
          .single(),
        {
          cache: true,
          cacheKey: `permissions_${userId}`,
          cacheTTL: this.CACHE_TTL
        }
      );
      
      if (result.error || !result.data) return false;
      
      const { custom_permissions, role } = result.data as any;
      
      // Check custom permissions first
      if (custom_permissions && custom_permissions[permission] !== undefined) {
        return custom_permissions[permission];
      }
      
      // Check role-based permissions
      return this.hasRolePermission(role, permission);
      
    } catch (error: any) {
      handleError(error, { component: 'UserService', action: 'hasPermission' });
      return false;
    }
  }
  
  private hasRolePermission(role: UserRole, permission: string): boolean {
    const rolePermissions: Partial<Record<UserRole, string[]>> = {
      superadmin: ['*'], // All permissions
      administrator: [
        'user.manage', 'user.view', 'system.settings', 'reports.view',
        'inventory.manage', 'tasks.manage', 'properties.manage'
      ],
      property_manager: [
        'user.view', 'inventory.manage', 'tasks.manage', 'properties.view', 'reports.view'
      ],
      concierge: [
        'tasks.view', 'tasks.create', 'inventory.view', 'properties.view'
      ],
      housekeeping_staff: [
        'tasks.view', 'tasks.update', 'inventory.use'
      ],
      maintenance_staff: [
        'tasks.view', 'tasks.update', 'inventory.use'
      ],
      inventory_manager: [
        'inventory.manage', 'orders.manage', 'vendors.manage'
      ],
      housekeeper: [
        'tasks.view', 'tasks.update', 'inventory.use'
      ],
      manager: [
        'user.view', 'inventory.manage', 'tasks.manage', 'properties.view', 'reports.view'
      ],
      pool_service: [
        'tasks.view', 'tasks.update', 'properties.view'
      ],
      external_partner: [
        'tasks.view', 'properties.view'
      ]
    };
    
    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }
  
  private mapProfileToUser(profile: any): User {
    return {
      id: profile.user_id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      avatar: profile.avatar || "/placeholder.svg",
      phone: profile.phone,
      customPermissions: profile.custom_permissions || {}
    };
  }
  
  clearCache(): void {
    apiClient.clearCache('user');
    apiClient.clearCache(this.CACHE_KEY);
  }
}

export const userService = new UserService();