import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SettingsCard from "@/components/settings/SettingsCard";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { securitySchema, defaultSecurityValues, SecurityFormValues } from "./types";

const SecuritySettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm, updatedAt } = useSystemSettingsForm<SecurityFormValues>({
    category: "security",
    defaultValues: defaultSecurityValues,
    schema: securitySchema,
  });

  const ipRestrictionEnabled = form.watch("ipRestriction");

  return (
    <Form {...form}>
      <SettingsCard
        title="Security Configuration"
        description="Configure authentication, password policies, lockouts and IP restrictions."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
        footer={<div className="text-xs text-muted-foreground">Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not saved yet"}</div>}
      >
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <FormField
            control={form.control}
            name="enableTwoFactor"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Two-Factor Authentication</FormLabel>
                  <FormDescription>
                    Require a second factor during login for added security
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Password policy */}
          <FormField
            control={form.control}
            name="enforceStrongPasswords"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enforce Strong Passwords</FormLabel>
                  <FormDescription>Require complex passwords for all users</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Login protection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="loginAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Login Attempts</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} placeholder="5" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Number of failed attempts before lockout</FormDescription>
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
                    <Input type="number" min={5} max={60} placeholder="15" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>How long accounts are locked after too many attempts</FormDescription>
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
                    <Input type="number" min={1} max={24} placeholder="8" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Maximum session lifetime before requiring re-login</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password expiration */}
          <FormField
            control={form.control}
            name="passwordExpiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Expiration (days)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={365} placeholder="90" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormDescription>0 to disable expiration</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* IP restriction */}
          <FormField
            control={form.control}
            name="ipRestriction"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Restrict by IP</FormLabel>
                  <FormDescription>Only allow logins from allowed IPs</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowedIPs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed IPs (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="192.168.1.1, 203.0.113.42/32" value={field.value || ""} onChange={field.onChange} disabled={!ipRestrictionEnabled} />
                </FormControl>
                <FormDescription>Supports CIDR notation. Leave blank to allow all when restriction is off.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default SecuritySettings;
