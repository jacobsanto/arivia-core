import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  enhancedGeneralSettingsSchema,
  brandingSettingsSchema,
  enhancedSecuritySettingsSchema,
  operationalSettingsSchema,
  defaultEnhancedGeneralValues,
  defaultBrandingValues,
  defaultEnhancedSecurityValues,
  defaultOperationalValues,
  EnhancedGeneralSettingsFormValues,
  BrandingSettingsFormValues,
  EnhancedSecuritySettingsFormValues,
  OperationalSettingsFormValues,
} from "@/types/systemSettings.types";

// Combined schema for all settings
const allSettingsSchema = z.object({
  general: enhancedGeneralSettingsSchema,
  branding: brandingSettingsSchema,
  security: enhancedSecuritySettingsSchema,
  operational: operationalSettingsSchema,
});

type AllSettingsFormValues = z.infer<typeof allSettingsSchema>;

const defaultAllValues: AllSettingsFormValues = {
  general: defaultEnhancedGeneralValues,
  branding: defaultBrandingValues,
  security: defaultEnhancedSecurityValues,
  operational: defaultOperationalValues,
};

export const useSystemSettingsManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const form = useForm<AllSettingsFormValues>({
    resolver: zodResolver(allSettingsSchema),
    defaultValues: defaultAllValues,
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load all settings categories
      const categories = ['enhanced_general', 'branding', 'enhanced_security', 'operational'];
      const promises = categories.map(category => 
        supabase
          .from('system_settings')
          .select('value, updated_at')
          .eq('category', category)
          .maybeSingle()
      );

      const results = await Promise.all(promises);
      
      let latestUpdate: string | null = null;
      const combinedSettings: any = {
        general: defaultEnhancedGeneralValues,
        branding: defaultBrandingValues,
        security: defaultEnhancedSecurityValues,
        operational: defaultOperationalValues,
      };

      results.forEach((result, index) => {
        if (result.data?.value) {
          const categoryKey = ['general', 'branding', 'security', 'operational'][index];
          if (categoryKey && typeof result.data.value === 'object' && result.data.value !== null) {
            const currentSettings = combinedSettings[categoryKey as keyof typeof combinedSettings];
            if (typeof currentSettings === 'object' && currentSettings !== null) {
              combinedSettings[categoryKey as keyof typeof combinedSettings] = { 
                ...currentSettings, 
                ...result.data.value 
              };
            }
          }
          
          if (result.data.updated_at && (!latestUpdate || result.data.updated_at > latestUpdate)) {
            latestUpdate = result.data.updated_at;
          }
        }
      });

      form.reset(combinedSettings);
      setUpdatedAt(latestUpdate);
    } catch (error) {
      console.error('Error loading system settings:', error);
      toast.error("Failed to load system settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllSettings = async (values: AllSettingsFormValues) => {
    try {
      setIsSaving(true);
      
      const categories = [
        { key: 'enhanced_general', data: values.general },
        { key: 'branding', data: values.branding },
        { key: 'enhanced_security', data: values.security },
        { key: 'operational', data: values.operational },
      ];

      const { data: { user } } = await supabase.auth.getUser();
      
      const promises = categories.map(({ key, data }) =>
        supabase.from('system_settings').upsert({
          category: key,
          value: data,
          updated_by: user?.id,
        })
      );

      await Promise.all(promises);
      
      // Log the configuration change
      await supabase.from('audit_logs').insert({
        level: 'info',
        message: 'System settings updated',
        metadata: {
          action: 'settings_update',
          categories: categories.map(c => c.key),
        },
      });

      setUpdatedAt(new Date().toISOString());
      form.reset(values); // Reset form to mark as clean
      toast.success("System settings saved successfully");
      
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error("Failed to save system settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    form.reset(defaultAllValues);
    toast.info("Settings reset to defaults");
  };

  const hasChanges = form.formState.isDirty;

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    form,
    isLoading,
    isSaving,
    hasChanges,
    updatedAt,
    onSave: form.handleSubmit(saveAllSettings),
    onReset: resetSettings,
    reload: loadSettings,
  };
};