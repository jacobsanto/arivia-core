
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { TenantUser } from '@/types/auth';

export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signUp(email: string, password: string, tenantId?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tenant_id: tenantId,
        }
      }
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  static async getCurrentUser(): Promise<TenantUser | null> {
    const session = await this.getCurrentSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: profile.name,
      role: profile.role,
      tenantId: profile.tenant_id,
      avatar: profile.avatar,
      permissions: profile.custom_permissions || {}
    };
  }
}
