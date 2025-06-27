
export interface TenantBranding {
  id: string;
  tenant_id: string;
  brand_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  custom_css?: string;
  theme_mode: 'light' | 'dark' | 'auto';
  custom_properties: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantContextType {
  tenantId: string | null;
  branding: TenantBranding | null;
  isLoading: boolean;
  setTenantId: (id: string | null) => void;
  updateBranding: (branding: Partial<TenantBranding>) => Promise<boolean>;
  refreshBranding: () => Promise<void>;
}
