
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
  | 'notifications'
  | 'backup';

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
      console.log(`Fetching settings for category: ${category}`);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', category)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (data?.settings) {
        console.log(`Settings retrieved for ${category}:`, data.settings);
      } else {
        console.log(`No settings found for ${category}, using defaults`);
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
      console.log(`Saving settings for category: ${category}`, settings);
      
      // Start a transaction
      const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .eq('category', category)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        console.log(`Updating existing settings with ID: ${existingSettings.id}`);
        // Update existing settings with retry mechanism
        result = await this.retryOperation(async () => {
          return await supabase
            .from('system_settings')
            .update({ 
              settings,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSettings.id)
            .select();
        });
      } else {
        console.log(`Creating new settings entry for category: ${category}`);
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
            .select();
        });
      }

      if (result.error) {
        console.error('Error saving settings:', result.error);
        throw result.error;
      }

      // Update local storage cache for offline support
      localStorage.setItem(`settings_${category}`, JSON.stringify(settings));
      console.log(`Settings for ${category} saved successfully`);

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
        console.log(`Operation attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`Operation failed on attempt ${attempt}/${maxRetries}:`, error);
        
        if (attempt === maxRetries) break;
        console.log(`Retrying in ${attempt} second(s)...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    console.error(`Operation failed after ${maxRetries} attempts`);
    throw lastError;
  }
};
