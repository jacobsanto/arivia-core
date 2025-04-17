
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { SettingsCategory } from '@/services/settings/settings.service';
import { z } from 'zod';
import { DefaultValues } from 'react-hook-form';

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
  
  // Get settings from the database
  const { settings, saveSettings, isLoading, isSaving } = useSystemSettings<T>(
    category,
    defaultValues
  );
  
  // Create form with validation
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: settings || defaultValues,
  });
  
  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      const formValues = form.getValues();
      const hasChanges = JSON.stringify(formValues) !== JSON.stringify(settings);
      setIsDirty(hasChanges);
    });
    
    return () => subscription.unsubscribe();
  }, [form, settings]);
  
  // Update form when settings are loaded
  useEffect(() => {
    if (!isLoading && settings) {
      // Merge with default values to ensure all fields exist
      const mergedSettings = {
        ...defaultValues,
        ...settings,
      };
      form.reset(mergedSettings);
    }
  }, [settings, isLoading, form, defaultValues]);
  
  // Handle form submission
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
        form.reset(cleanData);
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
    form.reset(settings);
    setIsDirty(false);
    
    toast.info("Settings reset", {
      description: "Changes have been reverted to last saved values"
    });
  };
  
  return {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
    settings
  };
}
