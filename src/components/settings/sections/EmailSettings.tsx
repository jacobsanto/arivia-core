
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { EmailSettingsFormValues, defaultEmailValues, emailSettingsSchema } from "./email/types";
import ProviderSettings from "./email/ProviderSettings";
import SmtpSettings from "./email/SmtpSettings";
import SenderSettings from "./email/SenderSettings";
import NotificationSettings from "./email/NotificationSettings";
import EmailConnectionTester from "./email/EmailConnectionTester";

const EmailSettings: React.FC = () => {
  const { settings, saveSettings, isLoading, isSaving } = useSystemSettings<EmailSettingsFormValues>(
    'email',
    defaultEmailValues
  );

  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: settings,
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (!isLoading) {
      form.reset(settings);
    }
  }, [form, settings, isLoading]);

  function onSubmit(data: EmailSettingsFormValues) {
    saveSettings(data);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsCard 
            title="Email Configuration" 
            description="Configure email settings for system notifications"
            isLoading={isLoading}
            isSaving={isSaving}
            onSave={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-6">
              <ProviderSettings form={form} />
              
              <SmtpSettings form={form} />
              
              <SenderSettings form={form} />
              
              <NotificationSettings form={form} />
              
              <EmailConnectionTester />
            </div>
          </SettingsCard>
        </form>
      </Form>
    </div>
  );
};

export default EmailSettings;
