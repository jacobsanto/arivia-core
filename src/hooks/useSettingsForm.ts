
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { SettingsCategory } from '@/services/settings/settings.service';
import { z } from 'zod';

interface UseSettingsFormProps<T extends Record<string, any>> {
  category: SettingsCategory;
  defaultValues: T;
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
    defaultValues: settings,
  });
  
  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(form.formState.isDirty);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Update form when settings are loaded
  useEffect(() => {
    if (!isLoading) {
      form.reset(settings);
    }
  }, [settings, isLoading, form]);
  
  // Handle form submission
  const onSubmit = async (data: T) => {
    try {
      const success = await saveSettings(data);
      
      if (success) {
        form.reset(data);
        setIsDirty(false);
        
        toast.success("Settings saved successfully", {
          description: "Your settings have been updated."
        });
        
        if (onAfterSave) {
          onAfterSave(data);
        }
      }
    } catch (error: any) {
      toast.error("Failed to save settings", {
        description: error.message || "An unknown error occurred."
      });
    }
  };
  
  // Reset form to the last saved values
  const resetForm = () => {
    form.reset(settings);
    setIsDirty(false);
    
    toast.info("Settings reset", {
      description: "Changes have been reverted to last saved values."
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
