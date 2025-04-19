
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./schema";

interface TaskReminderFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const TaskReminderField: React.FC<TaskReminderFieldProps> = ({ form }) => {
  return (
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
  );
};
