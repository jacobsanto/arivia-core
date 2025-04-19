
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { MaintenanceFormValues } from "./schema";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

interface TaskSwitchesProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const TaskSwitches: React.FC<TaskSwitchesProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="autoAssignTasks"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Auto-assign Tasks</FormLabel>
              <FormDescription>
                Automatically assign maintenance tasks based on workload
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
              <FormLabel className="text-base">Enable Recurring Tasks</FormLabel>
              <FormDescription>
                Allow creation of scheduled recurring maintenance tasks
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
  );
};
