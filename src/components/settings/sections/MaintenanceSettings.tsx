
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import SettingsCard from "../SettingsCard";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { toast } from "sonner";
import { maintenanceSchema, defaultMaintenanceValues, MaintenanceFormValues } from "./maintenance/schema";
import { TaskReminderField } from "./maintenance/TaskReminderField";
import { PriorityField } from "./maintenance/PriorityField";
import { EmailField } from "./maintenance/EmailField";
import { TaskSwitches } from "./maintenance/TaskSwitches";

const MaintenanceSettings: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  const { settings, saveSettings, isLoading } = useSystemSettings<MaintenanceFormValues>(
    'maintenance', 
    defaultMaintenanceValues
  );

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: settings || defaultMaintenanceValues,
  });

  // Initialize form when settings are loaded
  React.useEffect(() => {
    if (!isLoading && settings && !isInitialized) {
      form.reset(settings);
      setIsInitialized(true);
    }
  }, [settings, isLoading, form, isInitialized]);

  // Monitor form changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      console.log("Form values changed:", form.getValues());
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: MaintenanceFormValues) {
    try {
      console.log("Submitting maintenance settings:", data);
      const success = await saveSettings(data);
      
      if (success) {
        toast.success('Maintenance settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save maintenance settings:', error);
      toast.error('Failed to save settings');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SettingsCard 
          title="Maintenance Configuration" 
          description="Configure settings for the maintenance system"
          isLoading={isLoading}
        >
          <div className="space-y-6">
            <TaskReminderField form={form} />
            <PriorityField form={form} />
            <EmailField form={form} />
            <TaskSwitches form={form} />
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};

export default MaintenanceSettings;
