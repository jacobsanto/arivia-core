import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EnhancedSecuritySettingsFormValues } from "@/types/systemSettings.types";

interface EnhancedSecuritySettingsProps {
  form: any;
}

const EnhancedSecuritySettings: React.FC<EnhancedSecuritySettingsProps> = ({ form }) => {
  const ipRestrictionEnabled = form.watch("ipRestriction");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage the application's security posture and enforce access policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="minimumPasswordLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Password Length</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={6} 
                  max={20} 
                  value={field.value} 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              </FormControl>
              <FormDescription>
                Enforced when users change passwords on their profile page
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableTwoFactor"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                <FormDescription>
                  Triggers mandatory 2FA setup for all users on next login
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sessionTimeoutMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Timeout (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={15} 
                  max={1440} 
                  value={field.value} 
                  onChange={(e) => field.onChange(Number(e.target.value))} 
                />
              </FormControl>
              <FormDescription>
                Auto-logout after this period of inactivity (15 min - 24 hours)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="loginAttempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Login Attempts</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={field.value} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>Failed attempts before lockout</FormDescription>
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
                    min={5} 
                    max={60} 
                    value={field.value} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>Account lockout period</FormDescription>
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
                    min={0} 
                    max={365} 
                    value={field.value} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormDescription>0 to disable expiration</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="enforceStrongPasswords"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enforce Strong Passwords</FormLabel>
                <FormDescription>
                  Require complex passwords with mixed case, numbers, and symbols
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ipRestriction"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">IP Restriction</FormLabel>
                <FormDescription>
                  Only allow logins from specified IP addresses
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {ipRestrictionEnabled && (
          <FormField
            control={form.control}
            name="allowedIPs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed IP Addresses</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="192.168.1.1, 203.0.113.42/32" 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list. Supports CIDR notation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSecuritySettings;