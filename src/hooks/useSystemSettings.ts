
import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService, SettingsCategory } from '@/services/settings/settings.service';
import { toast } from 'sonner';

export function useSystemSettings<T extends Record<string, any>>(
  category: SettingsCategory,
  defaultValues: T
) {
  const [settings, setSettings] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const mountedRef = useRef(true);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const data = await settingsService.getSettings(category);
      if (mountedRef.current) {
        // Merge with default values to ensure all expected fields exist
        const mergedSettings = { ...defaultValues, ...data } as T;
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      if (mountedRef.current) {
        toast.error("Failed to load settings", {
          description: "Using default values"
        });
        // Set default values in case of error
        setSettings(defaultValues);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [category, defaultValues]);

  useEffect(() => {
    mountedRef.current = true;
    loadSettings();
    return () => {
      mountedRef.current = false;
    };
  }, [loadSettings]);

  const saveSettings = async (newSettings: T) => {
    if (isSaving) return false;
    
    setIsSaving(true);
    try {
      // Combine current settings with new settings to ensure all fields are preserved
      const updatedSettings = settings 
        ? { ...settings, ...newSettings } 
        : { ...defaultValues, ...newSettings };
        
      const success = await settingsService.saveSettings(category, updatedSettings);
      
      if (success && mountedRef.current) {
        setSettings(updatedSettings);
      }
      return success;
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings");
      return false;
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return { 
    settings: settings || defaultValues, 
    saveSettings, 
    isLoading, 
    isSaving 
  };
}
