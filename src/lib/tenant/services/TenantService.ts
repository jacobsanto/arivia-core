
import { supabase } from '@/integrations/supabase/client';
import { TenantBranding } from '@/types/tenant';
import { toast } from 'sonner';

export class TenantService {
  static async getTenantBranding(tenantId: string): Promise<TenantBranding | null> {
    try {
      const { data, error } = await supabase
        .from('tenant_branding')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no branding found, return default
        if (error.code === 'PGRST116') {
          return this.getDefaultBranding(tenantId);
        }
        throw error;
      }

      return data as TenantBranding;
    } catch (error: any) {
      console.error('Error fetching tenant branding:', error);
      return this.getDefaultBranding(tenantId);
    }
  }

  static async updateTenantBranding(
    tenantId: string, 
    updates: Partial<TenantBranding>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenant_branding')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId);

      if (error) throw error;
      
      toast.success('Branding updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating tenant branding:', error);
      toast.error('Failed to update branding');
      return false;
    }
  }

  static async createTenantBranding(branding: Omit<TenantBranding, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenant_branding')
        .insert(branding);

      if (error) throw error;
      
      toast.success('Tenant branding created successfully');
      return true;
    } catch (error: any) {
      console.error('Error creating tenant branding:', error);
      toast.error('Failed to create tenant branding');
      return false;
    }
  }

  static getDefaultBranding(tenantId: string): TenantBranding {
    return {
      id: 'default',
      tenant_id: tenantId,
      brand_name: 'Arivia Villas',
      logo_url: '/arivia-logo-full-dark-bg.png',
      favicon_url: '/arivia-logo-icon-black.png',
      primary_color: '#2563EB',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_family: 'Inter',
      theme_mode: 'light',
      custom_properties: {
        headerStyle: 'elegant',
        cardRadius: 'lg',
        shadowIntensity: 'medium'
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static applyBrandingToDocument(branding: TenantBranding): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--brand-primary', branding.primary_color);
    root.style.setProperty('--brand-secondary', branding.secondary_color);
    root.style.setProperty('--brand-accent', branding.accent_color);
    root.style.setProperty('--brand-background', branding.background_color);
    root.style.setProperty('--brand-text', branding.text_color);
    root.style.setProperty('--brand-font-family', branding.font_family);
    
    // Set data attributes for tenant-specific styling
    root.setAttribute('data-tenant', branding.tenant_id);
    root.setAttribute('data-theme', branding.theme_mode);
    
    // Apply custom CSS if provided
    if (branding.custom_css) {
      this.injectCustomCSS(branding.custom_css);
    }
    
    // Update favicon if provided
    if (branding.favicon_url) {
      this.updateFavicon(branding.favicon_url);
    }
    
    // Update page title
    document.title = `${branding.brand_name} - Operations Platform`;
  }

  private static injectCustomCSS(css: string): void {
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'tenant-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  private static updateFavicon(faviconUrl: string): void {
    const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (existingFavicon) {
      existingFavicon.href = faviconUrl;
    } else {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = faviconUrl;
      document.head.appendChild(favicon);
    }
  }
}
