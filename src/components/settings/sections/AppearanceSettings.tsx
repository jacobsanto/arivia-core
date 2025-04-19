
import React from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Palette, Monitor, MoonStar, SunMedium } from "lucide-react";

// Define validation schema
const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  primaryColor: z.string(),
  accentColor: z.string(),
  enableCustomLogo: z.boolean(),
  logoUrl: z.string().optional(),
  customFontFamily: z.string().optional(),
  enableAnimations: z.boolean(),
  highContrastMode: z.boolean(),
  compactMode: z.boolean(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

const defaultAppearanceValues: AppearanceFormValues = {
  theme: "system",
  primaryColor: "#3B82F6",
  accentColor: "#F59E0B",
  enableCustomLogo: false,
  logoUrl: "",
  customFontFamily: "",
  enableAnimations: true,
  highContrastMode: false,
  compactMode: false,
};

const AppearanceSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm<AppearanceFormValues>({
    category: 'appearance',
    defaultValues: defaultAppearanceValues,
    schema: appearanceSchema
  });

  // Watch values to show conditional fields
  const enableCustomLogo = form.watch("enableCustomLogo");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsLayout
          title="Appearance Settings"
          description="Customize the appearance of the application"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(onSubmit)}
          onReset={resetForm}
        >
          <SettingsSection title="Theme" description="Configure the application theme">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Mode</FormLabel>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={field.value === "light" ? "default" : "outline"}
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => field.onChange("light")}
                      >
                        <SunMedium className="h-5 w-5" />
                        <span>Light</span>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "dark" ? "default" : "outline"}
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => field.onChange("dark")}
                      >
                        <MoonStar className="h-5 w-5" />
                        <span>Dark</span>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "system" ? "default" : "outline"}
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => field.onChange("system")}
                      >
                        <Monitor className="h-5 w-5" />
                        <span>System</span>
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Primary Color</FormLabel>
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormDescription>
                      Main color used throughout the interface
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Accent Color</FormLabel>
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormDescription>
                      Secondary color used for highlights and accents
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Branding" description="Configure logo and branding">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enableCustomLogo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Custom Logo</FormLabel>
                      <FormDescription>
                        Use a custom logo instead of the default
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {enableCustomLogo && (
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL of your logo image
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="customFontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Font</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Default System Font</SelectItem>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Font family used throughout the application
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Accessibility" description="Configure accessibility options">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enableAnimations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Animations</FormLabel>
                      <FormDescription>
                        Enable UI animations and transitions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="highContrastMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">High Contrast Mode</FormLabel>
                      <FormDescription>
                        Increase contrast for better visibility
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Compact Mode</FormLabel>
                      <FormDescription>
                        Reduce spacing and padding in the UI
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default AppearanceSettings;
