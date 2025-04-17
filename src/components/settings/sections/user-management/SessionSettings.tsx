
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UserManagementFormValues } from "./types";

interface SessionSettingsProps {
  form: UseFormReturn<UserManagementFormValues>;
}

const SessionSettings: React.FC<SessionSettingsProps> = ({ form }) => {
  return (
    <div>
      <FormField
        control={form.control}
        name="sessionTimeout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Session Timeout (minutes)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              How long before an inactive session expires (10-1440 minutes)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SessionSettings;
