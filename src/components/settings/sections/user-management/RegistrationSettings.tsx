
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UserManagementFormValues } from "./types";

interface RegistrationSettingsProps {
  form: UseFormReturn<UserManagementFormValues>;
}

const RegistrationSettings: React.FC<RegistrationSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="allowUserRegistration"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Allow User Registration</FormLabel>
              <FormDescription>
                Enable to allow users to create their own accounts
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
        name="defaultUserRole"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Role</FormLabel>
            <Select 
              onValueChange={field.onChange}
              value={field.value || "guest"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Default role assigned to new users
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RegistrationSettings;
