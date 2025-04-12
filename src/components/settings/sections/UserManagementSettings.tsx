
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";

const userManagementSchema = z.object({
  allowUserRegistration: z.boolean(),
  defaultUserRole: z.string(),
  passwordMinLength: z.number().min(8).max(32),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSymbols: z.boolean(),
  sessionTimeout: z.number().min(10).max(1440),
});

type UserManagementFormValues = z.infer<typeof userManagementSchema>;

const UserManagementSettings: React.FC = () => {
  const form = useForm<UserManagementFormValues>({
    resolver: zodResolver(userManagementSchema),
    defaultValues: {
      allowUserRegistration: false,
      defaultUserRole: "property_manager",
      passwordMinLength: 12,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      sessionTimeout: 120,
    },
  });

  function onSubmit(data: UserManagementFormValues) {
    toast.success("User management settings updated", {
      description: "Your changes have been saved."
    });
    console.log("User management settings saved:", data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsCard 
          title="User Management" 
          description="Configure user registration and access settings"
        >
          <div className="space-y-6">
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Default role assigned to new users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordMinLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Password Length</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum characters required for passwords (8-32)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireNumbers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require Numbers</FormLabel>
                    <FormDescription>
                      Passwords must contain at least one number
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
              name="passwordRequireSymbols"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require Symbols</FormLabel>
                    <FormDescription>
                      Passwords must contain at least one special character
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
        </SettingsCard>
      </form>
    </Form>
  );
};

export default UserManagementSettings;
