import { useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type UseSettingsFormParams<T> = {
  category: string;
  defaultValues: T;
  schema: any; // z.ZodSchema<T> but keep generic to avoid coupling
  onAfterSave?: () => void;
};

export function useSettingsForm<T>({ category, defaultValues, schema, onAfterSave }: UseSettingsFormParams<T>): {
  form: UseFormReturn<T>;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSubmit: (values: T) => void;
  resetForm: () => void;
} {
  const storageKey = useMemo(() => `arivia.settings.${category}`, [category]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  useEffect(() => {
    // Load any persisted values for this settings category
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        form.reset({ ...(defaultValues as any), ...parsed });
      }
    } catch (e) {
      console.warn(`Failed to load settings for ${category}`, e);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const onSubmit = (values: T) => {
    setIsSaving(true);
    try {
      // Persist locally for now; backend persistence can be added later
      localStorage.setItem(storageKey, JSON.stringify(values));
      onAfterSave?.();
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => form.reset(defaultValues);

  return {
    form,
    isLoading,
    isSaving,
    isDirty: form.formState.isDirty,
    onSubmit,
    resetForm,
  };
}
