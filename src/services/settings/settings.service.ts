
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SettingsCategory = 
  | 'general' 
  | 'email' 
  | 'appearance' 
  | 'security' 
  | 'integration' 
  | 'maintenance'
  | 'user-management';

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

      // Ensure we return an object even if data.settings is a primitive
      return data?.settings ? 
        (typeof data.settings === 'object' ? data.settings : { value: data.settings }) : 
        {};
    } catch (error: any) {
      console.error('Failed to fetch settings:', error.message);
      return {};
    }
  },

  async saveSettings(category: SettingsCategory, settings: Record<string, any>): Promise<boolean> {
    try {
      // Check if settings for this category already exist
      const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .eq('category', category)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('system_settings')
          .update({ settings })
          .eq('id', existingSettings.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('system_settings')
          .insert({ category, settings });
      }

      if (result.error) {
        throw result.error;
      }

      return true;
    } catch (error: any) {
      console.error('Failed to save settings:', error.message);
      toast.error('Failed to save settings', {
        description: error.message
      });
      return false;
    }
  },

  async getUserSettings(userId: string, key: string): Promise<Record<string, any> | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      // Ensure we return an object even if data.setting_value is a primitive
      return data?.setting_value ? 
        (typeof data.setting_value === 'object' ? data.setting_value : { value: data.setting_value }) : 
        null;
    } catch (error: any) {
      console.error('Failed to fetch user settings:', error.message);
      return null;
    }
  },

  async saveUserSettings(userId: string, key: string, value: Record<string, any>): Promise<boolean> {
    try {
      // Check if settings for this user and key already exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .eq('setting_key', key)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('user_settings')
          .update({ setting_value: value })
          .eq('id', existingSettings.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('user_settings')
          .insert({ user_id: userId, setting_key: key, setting_value: value });
      }

      if (result.error) {
        throw result.error;
      }

      return true;
    } catch (error: any) {
      console.error('Failed to save user settings:', error.message);
      toast.error('Failed to save user settings', {
        description: error.message
      });
      return false;
    }
  }
};
