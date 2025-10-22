import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function computeDiff(before: any, after: any) {
  const changes: Record<string, { before: any; after: any }> = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  keys.forEach((k) => {
    const a = (before || {})[k];
    const b = (after || {})[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes[k] = { before: a, after: b };
    }
  });
  return changes;
}

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
  updatedAt: string | null;
} {
  const storageKey = useMemo(() => `arivia.settings.${category}`, [category]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const prevValuesRef = useRef<T>(defaultValues as any);

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
        .select("value, updated_at, updated_by")
        .eq("category", category)
        .maybeSingle();

      if (error) {
        console.warn(`Failed to load system settings for ${category}`, error);
        form.reset(defaultValues as any);
        return;
      }

      if (!data) {
        form.reset(defaultValues as any);
        return;
      }

      const merged = Object.assign({}, defaultValues as any, (data?.value ?? {}));
      form.reset(merged);
      prevValuesRef.current = merged as any;
      setUpdatedAt(data.updated_at ?? null);

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
      const { data: upserted, error } = await supabase
        .from("system_settings")
        .upsert(
          {
            key: category, // Use key field
            category,
            value: values as any,
            updated_by: userData.user?.id ?? null,
          } as any,
          { onConflict: "category" }
        )
        .select("updated_at")
        .single();

      if (error) throw error;

      // Audit log
      try {
        const changes = computeDiff(prevValuesRef.current, values);
        await supabase.from("audit_logs").insert({
          action: "update_settings",
          user_id: userData.user?.id ?? null,
          level: "info",
          message: `Updated system settings: ${category}`,
          route: "/admin/settings",
          metadata: { category, changes },
        } as any);
      } catch (e) {
        console.warn("Failed to write audit log", e);
      }

      // Persist locally as well
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (_) {}

      setUpdatedAt(upserted?.updated_at ?? new Date().toISOString());
      prevValuesRef.current = values as any;

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
    updatedAt,
  };
}
