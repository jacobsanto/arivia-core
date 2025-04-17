
import { useState, useEffect, useCallback } from 'react';
import { settingsService, SettingsCategory } from '@/services/settings/settings.service';
import { toast } from 'sonner';

export function useSystemSettings<T extends Record<string, any>>(
  category: SettingsCategory,
  defaultValues: T
) {
  const [settings, setSettings] = useState<T>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getSettings(category);
      // Merge with default values to ensure all expected fields exist
      const mergedSettings = { ...defaultValues, ...data };
      setSettings(mergedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error("Failed to load settings", {
        description: "Using default values"
      });
    } finally {
      setIsLoading(false);
    }
  }, [category, defaultValues]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: Partial<T>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const success = await settingsService.saveSettings(category, updatedSettings);
      
      if (success) {
        setSettings(updatedSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, updateSettings: saveSettings, saveSettings, isLoading, isSaving };
}
