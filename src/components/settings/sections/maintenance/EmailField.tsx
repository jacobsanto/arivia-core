
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./schema";

interface EmailFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const EmailField: React.FC<EmailFieldProps> = ({ form }) => {
  return (
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
  );
};
