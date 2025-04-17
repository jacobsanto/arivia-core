
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { toastService } from '@/services/toast';
import { offlineManager } from '@/utils/offlineManager';

export interface AutosaveOptions {
  entityType: string;
  saveFunction: (data: any) => Promise<any>;
  debounceDuration?: number;
  notifyOnSave?: boolean;
  detectChanges?: boolean;
}

export function useAutosave<T>(
  data: T,
  options: AutosaveOptions
) {
  const [lastSavedData, setLastSavedData] = useState<T>(data);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Check for online status and update state
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

  // Check if data has changed compared to last saved data
  useEffect(() => {
    if (options.detectChanges) {
      const isChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData);
      setHasUnsavedChanges(isChanged);
    }
  }, [data, lastSavedData, options.detectChanges]);

  // Create debounced save function
  const saveData = useCallback(
    debounce(async (currentData: T) => {
      if (!currentData) return;
      
      setIsSaving(true);
      
      try {
        if (isOffline) {
          // Store data for offline sync
          offlineManager.storeOfflineData(
            options.entityType,
            'update',
            currentData
          );
          
          if (options.notifyOnSave) {
            toastService.info('Changes saved offline', {
              description: 'Will sync when you reconnect to the internet.'
            });
          }
        } else {
          // Online save
          await options.saveFunction(currentData);
          
          if (options.notifyOnSave) {
            toastService.success('Saved', {
              description: 'Your changes have been saved.'
            });
          }
        }
        
        setLastSavedData(currentData);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving data:', error);
        toastService.error('Failed to save', {
          description: 'Please try again or check your connection.'
        });
      } finally {
        setIsSaving(false);
      }
    }, options.debounceDuration || 2000),
    [options.saveFunction, options.notifyOnSave, options.entityType, isOffline]
  );

  // Manual save function
  const save = useCallback(async () => {
    saveData.cancel();
    await saveData(data);
  }, [data, saveData]);

  // Trigger save on data change
  useEffect(() => {
    if (options.detectChanges && !hasUnsavedChanges) {
      return;
    }
    
    saveData(data);
    
    return () => {
      saveData.cancel();
    };
  }, [data, saveData]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    isOffline,
    save,
  };
}
