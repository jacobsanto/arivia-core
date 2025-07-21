import React from "react";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { z } from "zod";
import { Shield, Lock, Clock, AlertTriangle } from "lucide-react";

const securitySettingsSchema = z.object({
  passwordMinLength: z.number().min(6).max(64),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSymbols: z.boolean(),
  passwordExpiryDays: z.number().min(0).max(365),
  loginAttempts: z.number().min(1).max(10),
  lockoutDuration: z.number().min(1).max(1440), // in minutes
  sessionDuration: z.number().min(15).max(10080), // in minutes
  twoFactorRequired: z.boolean(),
  twoFactorOptional: z.boolean(),
  passwordHistory: z.number().min(0).max(24),
  ipWhitelistEnabled: z.boolean(),
  suspiciousActivityDetection: z.boolean(),
  sessionConcurrencyLimit: z.number().min(1).max(10),
});

type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;

const defaultSecurityValues: SecuritySettingsFormValues = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: false,
  passwordExpiryDays: 90,
  loginAttempts: 5,
  lockoutDuration: 30,
  sessionDuration: 480, // 8 hours
  twoFactorRequired: false,
  twoFactorOptional: true,
  passwordHistory: 5,
  ipWhitelistEnabled: false,
  suspiciousActivityDetection: true,
  sessionConcurrencyLimit: 3,
};

const EnhancedSecuritySettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm({
    category: 'security',
    defaultValues: defaultSecurityValues,
    schema: securitySettingsSchema,
    onAfterSave: () => {
      toast.success("Security settings updated successfully");
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Password Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Policies
              </CardTitle>
              <CardDescription>
                Configure password complexity and security requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="passwordMinLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Password Length</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="6" 
                          max="64"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 8)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum number of characters required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordExpiryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Expiry (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="365"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 90)}
                        />
                      </FormControl>
                      <FormDescription>
                        Days before password expires (0 = never)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="passwordRequireUppercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Uppercase Letters</FormLabel>
                        <FormDescription>
                          At least one uppercase letter (A-Z)
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
                  name="passwordRequireLowercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Lowercase Letters</FormLabel>
                        <FormDescription>
                          At least one lowercase letter (a-z)
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
                  name="passwordRequireNumbers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Numbers</FormLabel>
                        <FormDescription>
                          At least one numeric digit (0-9)
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
                        <FormLabel className="text-base">Require Special Characters</FormLabel>
                        <FormDescription>
                          At least one special symbol (!@#$%^&*)
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
                  name="passwordHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password History</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="24"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of previous passwords to remember (0 = disable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Configure login security and session management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          min="1" 
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                        />
                      </FormControl>
                      <FormDescription>
                        Failed attempts before lockout
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
                      <FormLabel>Lockout Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="1440"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormDescription>
                        Account lockout duration
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
                      <FormLabel>Session Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          max="10080"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 480)}
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-logout after inactivity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sessionConcurrencyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concurrent Session Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum simultaneous sessions per user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Configure multi-factor authentication requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twoFactorRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require 2FA for All Users</FormLabel>
                      <FormDescription>
                        Mandatory two-factor authentication
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
                name="twoFactorOptional"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Optional 2FA</FormLabel>
                      <FormDescription>
                        Users can enable 2FA voluntarily
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.watch("twoFactorRequired")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Advanced Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Advanced Security
              </CardTitle>
              <CardDescription>
                Configure advanced security monitoring and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="suspiciousActivityDetection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Suspicious Activity Detection</FormLabel>
                      <FormDescription>
                        Monitor and alert on unusual login patterns
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
                name="ipWhitelistEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">IP Address Whitelisting</FormLabel>
                      <FormDescription>
                        Restrict access to specific IP addresses
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={!isDirty || isSaving}
            >
              Reset Changes
            </Button>
            <div className="flex gap-2">
              {isDirty && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
              <Button 
                type="submit" 
                disabled={!isDirty || isSaving}
                className="min-w-20"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EnhancedSecuritySettings;