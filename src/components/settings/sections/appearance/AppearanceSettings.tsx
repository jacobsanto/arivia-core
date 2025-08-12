import React, { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { appearanceSettingsSchema, defaultAppearanceValues, AppearanceSettingsFormValues } from "./types";

function applyTheme(theme: "system" | "light" | "dark") {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

function applyAccent(accentHex: string) {
  const root = document.documentElement;
  root.style.setProperty('--accent-hex', accentHex);
}

function applyFontScale(scale: number) {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(scale));
}

function applyRadius(radius: "none" | "sm" | "md" | "lg" | "xl") {
  const map: Record<string, string> = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  };
  document.documentElement.style.setProperty('--radius', map[radius] ?? '8px');
}

const AppearanceSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<AppearanceSettingsFormValues>({
    category: "appearance",
    defaultValues: defaultAppearanceValues,
    schema: appearanceSettingsSchema,
  });

  const theme = form.watch('theme');
  const accent = form.watch('accentColor');
  const fontScale = form.watch('fontScale');
  const radius = form.watch('radius');
  const reducedMotion = form.watch('reducedMotion');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  useEffect(() => {
    applyFontScale(fontScale);
  }, [fontScale]);

  useEffect(() => {
    applyRadius(radius);
  }, [radius]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--motion-scale', reducedMotion ? '0' : '1');
  }, [reducedMotion]);

  return (
    <Form {...form}>
      <SettingsCard
        title="Appearance"
        description="Theme, accent color, typography scale, and motion preferences."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="text-xs text-muted-foreground">Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</div>}
      >
        <div className="space-y-6">
          {/* Theme */}
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Match system or force light/dark mode</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accent color */}
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accent Color</FormLabel>
                <FormControl>
                  <Input type="color" value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription>Used for highlights and emphasis</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Font scale and radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fontScale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Scale</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0.85} max={1.25} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Adjust overall typography size</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corner Radius</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Controls rounded corners for UI elements</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Layout and motion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="compactMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Compact Mode</FormLabel>
                    <FormDescription>Tighter spacing for dense views</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reducedMotion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Reduce Motion</FormLabel>
                    <FormDescription>Minimize animations and transitions</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </SettingsCard>
    </Form>
  );
};

export default AppearanceSettings;
