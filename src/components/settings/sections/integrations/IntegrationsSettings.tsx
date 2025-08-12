import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { integrationsSchema, defaultIntegrationsValues, IntegrationsFormValues } from "./types";
import SettingsHistoryDialog from "@/components/settings/SettingsHistoryDialog";

const IntegrationsSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<IntegrationsFormValues>({
    category: "integrations",
    defaultValues: defaultIntegrationsValues,
    schema: integrationsSchema,
  });

  const enableGuesty = form.watch("enableGuesty");

  return (
    <Form {...form}>
      <SettingsCard
        title="Integrations"
        description="Manage third-party connections like Guesty. Private API keys are stored securely via Supabase secrets."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="w-full flex items-center justify-between text-xs text-muted-foreground"><span>Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</span><SettingsHistoryDialog category="integrations" /></div>}
      >
        <div className="space-y-6">
          {/* Guesty toggle */}
          <FormField
            control={form.control}
            name="enableGuesty"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Guesty Integration</FormLabel>
                  <FormDescription>
                    Requires setting your Guesty API key in Supabase secrets (secure). We'll use it from edge functions.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Booking sync */}
          <FormField
            control={form.control}
            name="guestySyncBookings"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sync Bookings</FormLabel>
                  <FormDescription>Keep reservations up to date from Guesty</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!enableGuesty} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Sync frequency */}
          <FormField
            control={form.control}
            name="syncIntervalMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sync Interval (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={5} max={1440} placeholder="15" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} disabled={!enableGuesty} />
                </FormControl>
                <FormDescription>How often we pull updates</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Webhooks */}
          <FormField
            control={form.control}
            name="enableWebhooks"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Webhooks</FormLabel>
                  <FormDescription>Receive real-time updates from Guesty via webhook</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!enableGuesty} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Test mode */}
          <FormField
            control={form.control}
            name="testMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Test Mode</FormLabel>
                  <FormDescription>Use sandbox endpoints and avoid mutating production data</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default IntegrationsSettings;
