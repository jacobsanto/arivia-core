
import { useState, useEffect } from 'react';
import { settingsService, SettingsCategory } from '@/services/settings/settings.service';
import { toast } from 'sonner';

export function useSystemSettings<T extends Record<string, any>>(
  category: SettingsCategory,
  defaultValues: T
) {
  const [settings, setSettings] = useState<T>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const data = await settingsService.getSettings(category);
        // Merge with default values to ensure all expected fields exist
        setSettings({ ...defaultValues, ...data });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [category]);

  const updateSettings = async (newSettings: Partial<T>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    return updatedSettings;
  };

  const saveSettings = async (newSettings?: Partial<T>) => {
    setIsSaving(true);
    try {
      const settingsToSave = newSettings ? await updateSettings(newSettings) : settings;
      const success = await settingsService.saveSettings(category, settingsToSave);
      
      if (success) {
        toast.success('Settings saved successfully');
      }
      return success;
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, updateSettings, saveSettings, isLoading, isSaving };
}
