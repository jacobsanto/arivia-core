
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
      description="Hours before a task is due when reminders should be sent"
    >
      <Input 
        type="number" 
        min={1} 
        max={72} 
        placeholder="24"
      />
    </FormFieldWrapper>
  );
};
