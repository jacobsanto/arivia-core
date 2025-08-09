
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const maxRetries = 3;
  const savedDataRef = useRef<T | null>(null);
  // Deduplicate toasts so users don't see repeated messages
  const offlineCacheToastShownRef = useRef(false);
  const defaultFallbackToastShownRef = useRef(false);

  // Watch online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load settings from database
  const loadSettings = useCallback(async (retry: boolean = false) => {
    if (!mountedRef.current) return;
    
    if (retry && retryCount >= maxRetries) {
      if (mountedRef.current) {
        setIsLoading(false);
        // If we've exceeded retry attempts, use cached data or default values
        if (savedDataRef.current) {
          setSettings(savedDataRef.current);
        } else {
          setSettings(defaultValues);
        }
      }
      return;
    }

    if (retry) {
      setRetryCount(prev => prev + 1);
    } else if (retryCount > 0) {
      setRetryCount(0);
    }
    
    try {
      if (isOffline) {
        // Use localStorage for offline cache
        const cachedData = localStorage.getItem(`settings_${category}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData) as T;
          if (mountedRef.current) {
            const mergedSettings = { ...defaultValues, ...parsed } as T;
            setSettings(mergedSettings);
            savedDataRef.current = mergedSettings;
          }
        } else {
          if (mountedRef.current) {
            setSettings(defaultValues);
          }
        }
        
        setIsLoading(false);
        return;
      }
      
      const data = await settingsService.getSettings(category);
      if (mountedRef.current) {
        // Merge with default values to ensure all expected fields exist
        const mergedSettings = { ...defaultValues, ...data } as T;
        setSettings(mergedSettings);
        savedDataRef.current = mergedSettings;
        
        // Cache settings in localStorage for offline use
        localStorage.setItem(`settings_${category}`, JSON.stringify(mergedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      if (mountedRef.current) {
        // If we have cached data, use it
        const cachedData = localStorage.getItem(`settings_${category}`);
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData) as T;
            setSettings({ ...defaultValues, ...parsed });
            if (!offlineCacheToastShownRef.current) {
              toast.info("Using cached settings", {
                description: "Could not connect to server",
                id: `settings-cache-${category}`
              });
              offlineCacheToastShownRef.current = true;
            }
          } catch (e) {
            // If we can't parse the cached data, use defaults
            setSettings(defaultValues);
            if (!defaultFallbackToastShownRef.current) {
              toast.error("Failed to load settings", {
                description: "Using default values",
                id: `settings-defaults-${category}`
              });
              defaultFallbackToastShownRef.current = true;
            }
          }
        } else {
          // Set default values in case of error with no cache
          setSettings(defaultValues);
          if (!defaultFallbackToastShownRef.current) {
            toast.error("Failed to load settings", {
              description: "Using default values",
              id: `settings-defaults-${category}`
            });
            defaultFallbackToastShownRef.current = true;
          }
        }
        
        // If we're online but failed to load, retry
        if (!isOffline && retry === false) {
          setTimeout(() => loadSettings(true), 3000);
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [category, defaultValues, isOffline, retryCount, maxRetries]);

  useEffect(() => {
    mountedRef.current = true;
    loadSettings();
    return () => {
      mountedRef.current = false;
    };
  }, [loadSettings, category]);

  // Effect to reload settings when coming back online
  useEffect(() => {
    if (!isOffline && !isLoading && settings) {
      loadSettings();
    }
  }, [isOffline]);

  const saveSettings = async (newSettings: T) => {
    if (isSaving) return false;
    
    setIsSaving(true);
    try {
      // Combine current settings with new settings to ensure all fields are preserved
      const updatedSettings = settings 
        ? { ...settings, ...newSettings } 
        : { ...defaultValues, ...newSettings };
        
      if (isOffline) {
        // In offline mode, we save to localStorage
        localStorage.setItem(`settings_${category}`, JSON.stringify(updatedSettings));
        localStorage.setItem(`settings_${category}_pending`, JSON.stringify(updatedSettings));
        
        if (mountedRef.current) {
          setSettings(updatedSettings);
          savedDataRef.current = updatedSettings;
        }
        
        toast.success("Settings saved offline", {
          description: "Changes will be synchronized when online"
        });
        return true;
      }
      
      const success = await settingsService.saveSettings(category, updatedSettings);
      
      if (success && mountedRef.current) {
        setSettings(updatedSettings);
        savedDataRef.current = updatedSettings;
        
        // Update localStorage cache
        localStorage.setItem(`settings_${category}`, JSON.stringify(updatedSettings));
        
        // Remove any pending changes
        localStorage.removeItem(`settings_${category}_pending`);
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
    isSaving,
    isOffline
  };
}
