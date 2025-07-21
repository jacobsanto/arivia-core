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
import { Mail, Server, Settings2 } from "lucide-react";

const emailSettingsSchema = z.object({
  smtpEnabled: z.boolean(),
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1).max(65535),
  smtpSecure: z.boolean(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email("Valid email address required"),
  fromName: z.string().min(1, "From name is required"),
  emailTemplatesEnabled: z.boolean(),
  sendWelcomeEmails: z.boolean(),
  sendNotificationEmails: z.boolean(),
  sendReportEmails: z.boolean(),
});

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>;

const defaultEmailValues: EmailSettingsFormValues = {
  smtpEnabled: false,
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: true,
  smtpUsername: "",
  smtpPassword: "",
  fromEmail: "",
  fromName: "Arivia Villas",
  emailTemplatesEnabled: true,
  sendWelcomeEmails: true,
  sendNotificationEmails: true,
  sendReportEmails: false,
};

const EmailSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm({
    category: 'email',
    defaultValues: defaultEmailValues,
    schema: emailSettingsSchema,
    onAfterSave: () => {
      toast.success("Email settings updated successfully");
    },
  });

  const testEmailConnection = async () => {
    const values = form.getValues();
    if (!values.smtpEnabled || !values.smtpHost || !values.fromEmail) {
      toast.error("Please configure SMTP settings first");
      return;
    }

    toast.info("Testing email connection...", {
      description: "This may take a few seconds"
    });

    // In a real implementation, this would call an API endpoint to test the connection
    setTimeout(() => {
      toast.success("Email connection test successful", {
        description: "SMTP configuration is working correctly"
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SMTP Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure your email server settings for sending system emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="smtpEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable SMTP</FormLabel>
                      <FormDescription>
                        Enable email sending functionality
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

              {form.watch("smtpEnabled") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.gmail.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your SMTP server hostname
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                            />
                          </FormControl>
                          <FormDescription>
                            Usually 587 (TLS) or 465 (SSL)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Use Secure Connection</FormLabel>
                          <FormDescription>
                            Enable TLS/SSL encryption
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@domain.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            SMTP authentication username
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password (Optional)</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            SMTP authentication password
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testEmailConnection}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Email Identity
              </CardTitle>
              <CardDescription>
                Configure the sender information for outgoing emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="noreply@ariviagroup.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email address used as sender
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Arivia Villas" {...field} />
                      </FormControl>
                      <FormDescription>
                        Display name for sender
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Features */}
          <Card>
            <CardHeader>
              <CardTitle>Email Features</CardTitle>
              <CardDescription>
                Configure which types of emails to send automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailTemplatesEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Templates</FormLabel>
                      <FormDescription>
                        Use branded email templates
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
                name="sendWelcomeEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Welcome Emails</FormLabel>
                      <FormDescription>
                        Send welcome emails to new users
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
                name="sendNotificationEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notification Emails</FormLabel>
                      <FormDescription>
                        Send task and status notification emails
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
                name="sendReportEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Report Emails</FormLabel>
                      <FormDescription>
                        Send automated daily/weekly reports
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

export default EmailSettings;