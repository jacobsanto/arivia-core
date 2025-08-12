import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { generalSettingsSchema, defaultGeneralValues, GeneralSettingsFormValues } from "./types";
import SettingsHistoryDialog from "@/components/settings/SettingsHistoryDialog";

const locales = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "el-GR", label: "Ελληνικά (Ελλάδα)" },
];

const timezones = [
  { value: "Europe/Athens", label: "Europe/Athens (GMT+2/+3)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "Europe/London" },
];

const GeneralSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<GeneralSettingsFormValues>({
    category: "general",
    defaultValues: defaultGeneralValues,
    schema: generalSettingsSchema,
  });

  return (
    <Form {...form}>
      <SettingsCard
        title="General"
        description="Basic application settings like organization, locale, and timezone."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="w-full flex items-center justify-between text-xs text-muted-foreground"><span>Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</span><SettingsHistoryDialog category="general" /></div>}
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input placeholder="Arivia Villas" {...field} />
                </FormControl>
                <FormDescription>Shown in titles and emails</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locales.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Language and formatting</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Used for scheduling</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="weekStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week Starts On</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                    <SelectItem value="Monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Calendar display preference</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default GeneralSettings;
