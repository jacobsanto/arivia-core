
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SecurityFormValues } from "./types";

interface AccountSecuritySettingsProps {
  form: UseFormReturn<SecurityFormValues>;
}

const AccountSecuritySettings: React.FC<AccountSecuritySettingsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="loginAttempts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Failed Login Attempts</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              Number of failed attempts before account lockout
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="lockoutDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lockout Duration (minutes)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              Duration to lock account after failed attempts
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="passwordExpiration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password Expiration (days)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              Days until password expires (0 for never)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="sessionDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Session Duration (hours)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              How long user sessions remain active
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AccountSecuritySettings;
