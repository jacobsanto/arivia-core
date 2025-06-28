
import { supabase } from '@/integrations/supabase/client';
import { User, TenantUser } from '@/types/auth';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      phone: profile.phone,
      secondaryRoles: profile.secondary_roles || [],
      customPermissions: typeof profile.custom_permissions === 'object' ? profile.custom_permissions as Record<string, boolean> : {}
    };
  },

  async createTenantUser(userData: Partial<TenantUser>): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'property_manager',
        phone: userData.phone,
        avatar: userData.avatar,
        secondary_roles: userData.secondaryRoles || [],
        custom_permissions: userData.customPermissions || {}
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      tenant_id: userData.tenant_id || '',
      tenant: userData.tenant
    } as TenantUser;
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
};
