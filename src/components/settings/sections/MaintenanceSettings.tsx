
import React from "react";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { maintenanceSchema, defaultMaintenanceValues, MaintenanceFormValues } from "./maintenance/schema";
import { TaskReminderField } from "./maintenance/TaskReminderField";
import { PriorityField } from "./maintenance/PriorityField";
import { EmailField } from "./maintenance/EmailField";
import { TaskSwitches } from "./maintenance/TaskSwitches";

const MaintenanceSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
    validationError
  } = useSettingsForm<MaintenanceFormValues>({
    category: 'maintenance',
    defaultValues: defaultMaintenanceValues,
    schema: maintenanceSchema,
    onAfterSave: (data) => {
      console.log("Maintenance settings saved successfully:", data);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsLayout
          title="Maintenance Configuration"
          description="Configure settings for the maintenance system"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(onSubmit)}
          onReset={resetForm}
        >
          <SettingsSection title="Task Configuration" description="Configure how maintenance tasks are created and managed">
            <div className="space-y-6">
              <TaskReminderField form={form} />
              <PriorityField form={form} />
            </div>
          </SettingsSection>

          <SettingsSection title="Notifications" description="Configure maintenance notification settings">
            <div className="space-y-6">
              <EmailField form={form} />
            </div>
          </SettingsSection>

          <SettingsSection title="Task Automation" description="Configure automatic task management">
            <TaskSwitches form={form} />
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default MaintenanceSettings;
