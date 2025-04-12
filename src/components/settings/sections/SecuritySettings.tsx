
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { RefreshCw, LockKeyhole } from "lucide-react";
import { securityUtils } from "@/utils/securityUtils";

const securitySchema = z.object({
  enableTwoFactor: z.boolean(),
  loginAttempts: z.number().min(1).max(10),
  lockoutDuration: z.number().min(5).max(60),
  passwordExpiration: z.number().min(0).max(365),
  enforceStrongPasswords: z.boolean(),
  sessionDuration: z.number().min(1).max(24),
  ipRestriction: z.boolean(),
  allowedIPs: z.string().optional(),
});

type SecurityFormValues = z.infer<typeof securitySchema>;

const SecuritySettings: React.FC = () => {
  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      enableTwoFactor: false,
      loginAttempts: 5,
      lockoutDuration: 15,
      passwordExpiration: 90,
      enforceStrongPasswords: true,
      sessionDuration: 8,
      ipRestriction: false,
      allowedIPs: "",
    },
  });

  function onSubmit(data: SecurityFormValues) {
    toast.success("Security settings updated", {
      description: "Your changes have been saved."
    });
    console.log("Security settings saved:", data);
  }

  const watchIpRestriction = form.watch("ipRestriction");

  const generateEncryptionKeys = () => {
    toast.info("Generating new encryption keys...");
    
    // In a real application, this would involve server-side key generation
    setTimeout(() => {
      toast.success("New encryption keys generated", {
        description: "Application encryption keys have been rotated."
      });
    }, 1500);
  };

  const securityChecks = [
    { name: "HTTPS", status: securityUtils.isSecureContext() },
    { name: "Cookies Enabled", status: securityUtils.areCookiesEnabled() },
    { name: "Local Storage Available", status: securityUtils.isLocalStorageAvailable() },
    { name: "Session Storage Available", status: securityUtils.isSessionStorageAvailable() },
    { name: "Modern Security Features", status: securityUtils.supportsModernSecurity() },
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsCard 
            title="Security Settings" 
            description="Configure system security and authentication options"
          >
            <div className="space-y-6">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Security Checks</h3>
                <div className="grid gap-2">
                  {securityChecks.map((check, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{check.name}</span>
                      <span className={`rounded-full px-2 py-1 text-xs ${check.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {check.status ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="enableTwoFactor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                      <FormDescription>
                        Require two-factor authentication for all users
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
                name="enforceStrongPasswords"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Strong Password Policy</FormLabel>
                      <FormDescription>
                        Enforce strong password requirements for all users
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
              
              <FormField
                control={form.control}
                name="ipRestriction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">IP Address Restriction</FormLabel>
                      <FormDescription>
                        Limit access to specific IP addresses
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
              
              {watchIpRestriction && (
                <FormField
                  control={form.control}
                  name="allowedIPs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed IP Addresses</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.1, 10.0.0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of allowed IP addresses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Encryption Key Management</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={generateEncryptionKeys}
                >
                  <RefreshCw className="h-4 w-4" />
                  <LockKeyhole className="h-4 w-4" />
                  Rotate Encryption Keys
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Warning: Rotating encryption keys will require re-encryption of sensitive data
                </p>
              </div>
            </div>
          </SettingsCard>
        </form>
      </Form>
    </div>
  );
};

export default SecuritySettings;
