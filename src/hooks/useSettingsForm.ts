
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { SettingsCategory } from '@/services/settings/settings.service';
import { z } from 'zod';
import { DefaultValues } from 'react-hook-form';
import { isEqual } from 'lodash';

interface UseSettingsFormProps<T extends Record<string, any>> {
  category: SettingsCategory;
  defaultValues: DefaultValues<T>;
  schema: z.ZodType<T>;
  onAfterSave?: (data: T) => void;
}

export function useSettingsForm<T extends Record<string, any>>({
  category,
  defaultValues,
  schema,
  onAfterSave,
}: UseSettingsFormProps<T>) {
  const [isDirty, setIsDirty] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get settings from the database
  const { settings, saveSettings, isLoading, isSaving } = useSystemSettings<T>(
    category,
    defaultValues as unknown as T
  );
  
  // Create form with validation
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as unknown as DefaultValues<T>,
  });
  
  // Initialize form once settings are loaded
  useEffect(() => {
    if (!isLoading && settings && !isInitialized) {
      // Merge with default values to ensure all fields exist
      const mergedSettings = {
        ...defaultValues,
        ...settings,
      };
      form.reset(mergedSettings as unknown as DefaultValues<T>);
      setIsInitialized(true);
    }
  }, [settings, isLoading, form, defaultValues, isInitialized]);
  
  // Track form changes using deep comparison
  useEffect(() => {
    if (!isInitialized) return;
    
    const subscription = form.watch((formData) => {
      const currentValues = form.getValues();
      const hasChanges = !isEqual(currentValues, settings);
      setIsDirty(hasChanges);
    });
    
    return () => subscription.unsubscribe();
  }, [form, settings, isInitialized]);
  
  // Handle form submission with proper cleanup
  const onSubmit = async (data: T) => {
    try {
      // Clean up empty string values to null
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value
        ])
      ) as T;

      const success = await saveSettings(cleanData);
      
      if (success) {
        // Update form state after successful save
        form.reset(cleanData as unknown as DefaultValues<T>);
        setIsDirty(false);
        
        toast.success("Settings saved successfully");
        
        if (onAfterSave) {
          onAfterSave(cleanData);
        }
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings", {
        description: error.message || "An unknown error occurred"
      });
    }
  };
  
  // Reset form to the last saved values
  const resetForm = () => {
    if (settings) {
      form.reset(settings as unknown as DefaultValues<T>);
      setIsDirty(false);
      
      toast.info("Settings reset", {
        description: "Changes have been reverted to last saved values"
      });
    }
  };
  
  return {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
    settings,
    isInitialized
  };
}
