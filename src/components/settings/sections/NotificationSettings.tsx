
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  notifyNewBooking: z.array(z.string()),
  notifyTaskAssigned: z.array(z.string()),
  notifyTaskCompleted: z.array(z.string()),
  notifyInventoryLow: z.array(z.string()),
  notifyMaintenanceIssue: z.array(z.string()),
  notifySystemUpdates: z.array(z.string()),
  dailyDigest: z.boolean(),
  weeklyReport: z.boolean(),
  notificationSounds: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const NotificationSettings: React.FC = () => {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      notifyNewBooking: ["email", "in-app"],
      notifyTaskAssigned: ["email", "push", "in-app"],
      notifyTaskCompleted: ["in-app"],
      notifyInventoryLow: ["email", "in-app"],
      notifyMaintenanceIssue: ["email", "push", "in-app"],
      notifySystemUpdates: ["email"],
      dailyDigest: true,
      weeklyReport: true,
      notificationSounds: true,
    },
  });

  function onSubmit(data: NotificationFormValues) {
    toast.success("Notification settings updated", {
      description: "Your notification preferences have been saved."
    });
    console.log("Notification settings saved:", data);
  }

  const notificationTypes = [
    { id: "email", label: "Email" },
    { id: "push", label: "Push" },
    { id: "in-app", label: "In-App" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsCard 
          title="Notification Settings" 
          description="Configure how and when you receive notifications"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Channels</h3>
              
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
                        Receive notifications on your devices
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
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications while using the app
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
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Select how you want to receive each type of notification
              </p>
              
              <FormField
                control={form.control}
                name="notifyNewBooking"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">New Bookings</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifyTaskAssigned"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">Tasks Assigned</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifyTaskCompleted"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">Tasks Completed</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifyInventoryLow"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">Low Inventory</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifyMaintenanceIssue"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">Maintenance Issues</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifySystemUpdates"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base font-normal">System Updates</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          {notificationTypes.map((type) => (
                            <ToggleGroupItem 
                              key={type.id} 
                              value={type.id}
                              aria-label={`Toggle ${type.label}`}
                              size="sm"
                            >
                              {type.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Summary Reports</h3>
              
              <FormField
                control={form.control}
                name="dailyDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Daily Digest</FormLabel>
                      <FormDescription>
                        Receive a daily summary of all activity
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
                name="weeklyReport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weekly Report</FormLabel>
                      <FormDescription>
                        Receive a weekly summary with analytics
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
            
            <FormField
              control={form.control}
              name="notificationSounds"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notification Sounds</FormLabel>
                    <FormDescription>
                      Play sounds for in-app notifications
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
        </SettingsCard>
      </form>
    </Form>
  );
};

export default NotificationSettings;
