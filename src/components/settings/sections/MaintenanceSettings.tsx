
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const maintenanceSchema = z.object({
  taskReminderHours: z.number().min(1).max(72),
  defaultTaskPriority: z.string(),
  autoAssignTasks: z.boolean(),
  enableRecurringTasks: z.boolean(),
  maintenanceEmail: z.string().email("Must be a valid email address").optional().or(z.literal('')),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

const MaintenanceSettings: React.FC = () => {
  const defaultValues: MaintenanceFormValues = {
    taskReminderHours: 24,
    defaultTaskPriority: "normal",
    autoAssignTasks: true,
    enableRecurringTasks: true,
    maintenanceEmail: "maintenance@arivia-villas.com",
  };

  const { settings, saveSettings, isLoading } = useSystemSettings<MaintenanceFormValues>(
    'maintenance', 
    defaultValues
  );

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: settings,
    values: settings
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (!isLoading) {
      Object.keys(settings).forEach(key => {
        form.setValue(key as keyof MaintenanceFormValues, 
          settings[key as keyof MaintenanceFormValues]);
      });
    }
  }, [settings, isLoading, form]);

  async function onSubmit(data: MaintenanceFormValues) {
    const success = await saveSettings(data);
    if (success) {
      form.reset(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsCard 
          title="Maintenance Configuration" 
          description="Configure settings for the maintenance system"
          isLoading={isLoading}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="taskReminderHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Reminder Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormDescription>
                    Hours before due date to send task reminders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultTaskPriority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Task Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default priority for new maintenance tasks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maintenanceEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Notification Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="maintenance@arivia-villas.com" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Email to receive maintenance notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoAssignTasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-Assign Tasks</FormLabel>
                    <FormDescription>
                      Automatically assign tasks based on staff availability and skills
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
              name="enableRecurringTasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Tasks</FormLabel>
                    <FormDescription>
                      Enable scheduling of recurring maintenance tasks
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

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};

export default MaintenanceSettings;
