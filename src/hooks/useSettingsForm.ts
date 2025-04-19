
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
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Get settings from the database
  const { settings, saveSettings, isLoading, isSaving, isOffline } = useSystemSettings<T>(
    category,
    defaultValues as unknown as T
  );
  
  // Create form with validation
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as unknown as DefaultValues<T>,
    mode: 'onChange'
  });
  
  // Initialize form once settings are loaded
  useEffect(() => {
    if (!isLoading && settings && !isInitialized) {
      // Merge with default values to ensure all fields exist
      const mergedSettings = {
        ...defaultValues,
        ...settings,
      };
      
      console.log("Initializing form with settings:", mergedSettings);
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
      
      // Clear validation errors when values change
      if (validationError) {
        setValidationError(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, settings, isInitialized, validationError]);
  
  // Handle form submission with proper cleanup
  const onSubmit = async (data: T) => {
    setValidationError(null);
    console.log("Submitting form data:", data);
    
    try {
      // Validate all fields first
      const result = await form.trigger();
      
      if (!result) {
        console.error("Form validation failed:", form.formState.errors);
        const errorMessages = Object.entries(form.formState.errors)
          .map(([field, error]) => `${field}: ${error.message}`)
          .join(", ");
        
        setValidationError(errorMessages);
        toast.error("Validation failed", {
          description: "Please check your inputs and try again"
        });
        return false;
      }
      
      // Clean up empty string values to null
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? null : value
        ])
      ) as T;

      console.log("Saving cleaned data:", cleanData);
      
      // Optimistic UI update - if the form data is valid, we reset the form first
      form.reset(cleanData as unknown as DefaultValues<T>);
      
      // Perform the actual save operation
      const success = await saveSettings(cleanData);
      
      if (success) {
        // Update form state after successful save
        setIsDirty(false);
        
        if (onAfterSave) {
          onAfterSave(cleanData);
        }
        return true;
      } else {
        // If save failed, we reset the form to the previous state
        form.reset(settings as unknown as DefaultValues<T>);
        setSaveAttempts(prev => prev + 1);
        
        // Only show toast error if we haven't tried too many times
        if (saveAttempts < 3) {
          toast.error("Failed to save settings", {
            description: "Please try again"
          });
        } else {
          toast.error("Persistent save errors", {
            description: "Please check your connection and try again later"
          });
        }
        return false;
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings", {
        description: error.message || "An unknown error occurred"
      });
      
      // Reset form to previous state
      form.reset(settings as unknown as DefaultValues<T>);
      return false;
    }
  };
  
  // Reset form to the last saved values
  const resetForm = () => {
    if (settings) {
      console.log("Resetting form to saved settings:", settings);
      form.reset(settings as unknown as DefaultValues<T>);
      setIsDirty(false);
      setValidationError(null);
      
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
    isInitialized,
    validationError,
    isOffline
  };
}
