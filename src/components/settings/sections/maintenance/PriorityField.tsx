
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./schema";

interface PriorityFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const PriorityField: React.FC<PriorityFieldProps> = ({ form }) => {
  return (
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
  );
};
