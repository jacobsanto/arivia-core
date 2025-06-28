
import { supabase } from '@/integrations/supabase/client';
import { User, TenantUser, safeRoleCast } from '@/types/auth';

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
      role: safeRoleCast(profile.role),
      avatar: profile.avatar,
      phone: profile.phone,
      secondaryRoles: profile.secondary_roles?.map((role: string) => safeRoleCast(role)) || [],
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
      role: safeRoleCast(data.role),
      tenantId: userData.tenantId || '',
      secondaryRoles: data.secondary_roles?.map((role: string) => safeRoleCast(role)) || [],
      customPermissions: data.custom_permissions as Record<string, boolean> || {}
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
    
    return {
      ...data,
      role: safeRoleCast(data.role),
      secondaryRoles: data.secondary_roles?.map((role: string) => safeRoleCast(role)) || [],
      customPermissions: data.custom_permissions as Record<string, boolean> || {}
    } as User;
  }
};
