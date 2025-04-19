
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MaintenanceFormValues } from "./schema";
import { FormFieldWrapper } from "./FormFieldWrapper";

interface TaskReminderFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const TaskReminderField: React.FC<TaskReminderFieldProps> = ({ form }) => {
  return (
    <FormFieldWrapper
      form={form}
      name="taskReminderHours"
      label="Task Reminder Hours"
      description="Hours before due date to send task reminders"
    >
      <Input 
        type="number"
        onChange={(e) => form.setValue('taskReminderHours', parseInt(e.target.value))}
      />
    </FormFieldWrapper>
  );
};
