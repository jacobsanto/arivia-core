
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
      customPermissions: profile.custom_permissions || {}
    };
  },

  async createTenantUser(userData: Partial<TenantUser>): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...userData,
        tenant_id: userData.tenant_id // Use snake_case for database
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      tenant_id: data.tenant_id // Map from database snake_case
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
