
import React from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define validation schema
const notificationSchema = z.object({
  inAppNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  taskAssignment: z.boolean(),
  taskStatusUpdate: z.boolean(),
  inventoryAlerts: z.boolean(),
  bookingNotifications: z.boolean(),
  maintenanceAlerts: z.boolean(),
  financialReports: z.boolean(),
  notificationFrequency: z.enum(["immediate", "hourly", "daily", "weekly"]),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const defaultNotificationValues: NotificationFormValues = {
  inAppNotifications: true,
  emailNotifications: true,
  pushNotifications: false,
  taskAssignment: true,
  taskStatusUpdate: true,
  inventoryAlerts: true,
  bookingNotifications: true,
  maintenanceAlerts: true,
  financialReports: false,
  notificationFrequency: "immediate",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

const NotificationSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm<NotificationFormValues>({
    category: 'notifications',
    defaultValues: defaultNotificationValues,
    schema: notificationSchema
  });

  // Watch values for conditional fields
  const quietHoursEnabled = form.watch("quietHoursEnabled");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsLayout
          title="Notification Settings"
          description="Configure how and when you receive notifications"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(onSubmit)}
          onReset={resetForm}
        >
          <SettingsSection title="Notification Channels" description="Configure notification delivery methods">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications within the application
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
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
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
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications on your devices
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

          <SettingsSection title="Notification Types" description="Choose which events trigger notifications">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="taskAssignment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Assignment</FormLabel>
                      <FormDescription>
                        When tasks are assigned to you
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
                name="taskStatusUpdate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Status Updates</FormLabel>
                      <FormDescription>
                        When task statuses change
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
                name="inventoryAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Inventory Alerts</FormLabel>
                      <FormDescription>
                        When inventory items are low or need attention
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
                name="bookingNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Booking Notifications</FormLabel>
                      <FormDescription>
                        When bookings are created, modified, or cancelled
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
                name="maintenanceAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Maintenance Alerts</FormLabel>
                      <FormDescription>
                        When maintenance issues are reported
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
                name="financialReports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Financial Reports</FormLabel>
                      <FormDescription>
                        When financial reports are generated
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

          <SettingsSection title="Notification Preferences" description="Configure notification timing and frequency">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notificationFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How frequently you want to receive batched notifications
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quietHoursEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Quiet Hours</FormLabel>
                      <FormDescription>
                        Don't send notifications during certain hours
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

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quietHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiet Hours Start</FormLabel>
                        <FormControl>
                          <input
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quietHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiet Hours End</FormLabel>
                        <FormControl>
                          <input
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default NotificationSettings;
