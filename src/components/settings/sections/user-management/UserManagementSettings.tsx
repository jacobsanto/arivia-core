import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { userManagementSchema, defaultUserManagementValues, UserManagementFormValues } from "./types";

const roles = [
  { value: "housekeeping_staff", label: "Housekeeping Staff" },
  { value: "property_manager", label: "Property Manager" },
  { value: "administrator", label: "Administrator" },
  { value: "superadmin", label: "Super Admin" },
];

const UserManagementSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<UserManagementFormValues>({
    category: "user-management",
    defaultValues: defaultUserManagementValues,
    schema: userManagementSchema,
  });

  return (
    <Form {...form}>
      <SettingsCard
        title="User Management Settings"
        description="Control registration, default roles, password policy and session timeout."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="text-xs text-muted-foreground">Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</div>}
      >
        <div className="space-y-6">
          {/* Registration toggle */}
          <FormField
            control={form.control}
            name="allowUserRegistration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Allow User Registration</FormLabel>
                  <FormDescription>Enable users to sign up directly</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Default role */}
          <FormField
            control={form.control}
            name="defaultUserRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default User Role</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Role assigned to newly created users</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password policy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="passwordMinLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Min Length</FormLabel>
                  <FormControl>
                    <Input type="number" min={8} max={32} placeholder="12" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Minimum number of characters required</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireNumbers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Require Numbers</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireSymbols"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Require Symbols</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Session timeout */}
          <FormField
            control={form.control}
            name="sessionTimeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Timeout (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={10} max={1440} placeholder="120" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormDescription>Auto-logout after inactivity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default UserManagementSettings;
