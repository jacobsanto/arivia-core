import { useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UseSystemSettingsFormParams<T> = {
  category: string;
  defaultValues: T;
  schema: any; // keep generic to avoid coupling
  onAfterSave?: () => void;
};

export function useSystemSettingsForm<T>({
  category,
  defaultValues,
  schema,
  onAfterSave,
}: UseSystemSettingsFormParams<T>): {
  form: UseFormReturn<T>;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSubmit: (values: T) => Promise<void>;
  resetForm: () => void;
  reload: () => Promise<void>;
} {
  const storageKey = useMemo(() => `arivia.settings.${category}`, [category]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: "onChange",
  });

  const loadFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", category)
        .single();

      if (error) {
        // PGRST116 = No rows found; treat as initial state
        if ((error as any)?.code !== "PGRST116") {
          console.warn(`Failed to load system settings for ${category}`, error);
        }
        form.reset(defaultValues as any);
        return;
      }

      const merged = Object.assign({}, defaultValues as any, (data?.value ?? {}));
      form.reset(merged);

      // Cache locally as a resilience measure (optional)
      try {
        localStorage.setItem(storageKey, JSON.stringify(merged));
      } catch (_) {}
    } catch (e) {
      console.warn(`Error loading settings for ${category}`, e);
      // Fallback to any locally cached values if available
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          form.reset(Object.assign({}, defaultValues as any, parsed));
        }
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const onSubmit = async (values: T) => {
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          {
            category,
            value: values as any,
            updated_by: userData.user?.id ?? null,
          },
          { onConflict: "category" }
        );

      if (error) throw error;

      // Persist locally as well
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (_) {}

      toast.success("Settings saved");
      form.reset(values);
      onAfterSave?.();
    } catch (e) {
      console.error("Failed to save settings", e);
      toast.error("Failed to save settings");
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
    reload: loadFromSupabase,
  };
}
