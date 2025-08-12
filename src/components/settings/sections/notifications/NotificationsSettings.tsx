import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { notificationSettingsSchema, defaultNotificationValues, NotificationSettingsFormValues } from "./types";

const NotificationsSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<NotificationSettingsFormValues>({
    category: "notifications",
    defaultValues: defaultNotificationValues,
    schema: notificationSettingsSchema,
  });

  const dailyDigest = form.watch("dailyDigest");

  return (
    <Form {...form}>
      <SettingsCard
        title="Notifications"
        description="Configure in-app and push notifications, alerts, and digests."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="text-xs text-muted-foreground">Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</div>}
      >
        <div className="space-y-6">
          {/* Channels */}
          <FormField
            control={form.control}
            name="enableInApp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable In-App Notifications</FormLabel>
                  <FormDescription>Show alerts inside the app interface</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enablePush"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Push Notifications</FormLabel>
                  <FormDescription>Require browser permission; setup service worker to receive pushes</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Event types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="taskDueReminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Task Due Reminders</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventoryLowStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Inventory Low Stock</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemAlerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">System Alerts</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Digest */}
          <FormField
            control={form.control}
            name="dailyDigest"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Daily Digest</FormLabel>
                  <FormDescription>Send a summary of activity once per day</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="digestTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Digest Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input type="time" value={field.value} onChange={field.onChange} disabled={!dailyDigest} />
                </FormControl>
                <FormDescription>Time is in your local timezone</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default NotificationsSettings;
