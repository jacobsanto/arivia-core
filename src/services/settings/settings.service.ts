
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SettingsCategory = 
  | 'general' 
  | 'email' 
  | 'appearance' 
  | 'security' 
  | 'integration' 
  | 'maintenance'
  | 'user-management'
  | 'notifications';

export interface SystemSettings {
  id: string;
  category: SettingsCategory;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  async getSettings(category: SettingsCategory): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', category)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      return data?.settings ? 
        (typeof data.settings === 'object' ? data.settings : { value: data.settings }) : 
        {};
    } catch (error: any) {
      console.error('Failed to fetch settings:', error.message);
      throw error;
    }
  },

  async saveSettings(category: SettingsCategory, settings: Record<string, any>): Promise<boolean> {
    try {
      // Start a transaction
      const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .eq('category', category)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        // Update existing settings with retry mechanism
        result = await this.retryOperation(async () => {
          return await supabase
            .from('system_settings')
            .update({ 
              settings,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSettings.id)
            .select()
            .single();
        });
      } else {
        // Insert new settings with retry mechanism
        result = await this.retryOperation(async () => {
          return await supabase
            .from('system_settings')
            .insert({ 
              category, 
              settings,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
        });
      }

      if (result.error) {
        console.error('Error saving settings:', result.error);
        throw result.error;
      }

      // Update local storage cache for offline support
      localStorage.setItem(`settings_${category}`, JSON.stringify(settings));

      return true;
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  // Helper function to retry failed operations
  async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    throw lastError;
  }
};
