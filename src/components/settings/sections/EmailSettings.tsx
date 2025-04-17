
import React from "react";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { EmailSettingsFormValues, defaultEmailValues, emailSettingsSchema } from "./email/types";
import ProviderSettings from "./email/ProviderSettings";
import SmtpSettings from "./email/SmtpSettings";
import SenderSettings from "./email/SenderSettings";
import NotificationSettings from "./email/NotificationSettings";
import EmailConnectionTester from "./email/EmailConnectionTester";

const EmailSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm
  } = useSettingsForm<EmailSettingsFormValues>({
    category: 'email',
    defaultValues: defaultEmailValues,
    schema: emailSettingsSchema
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsLayout
          title="Email Configuration"
          description="Configure email settings for system notifications"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(onSubmit)}
          onReset={resetForm}
          actions={<EmailConnectionTester />}
        >
          <SettingsSection title="Email Provider" description="Select your email delivery service">
            <ProviderSettings form={form} />
          </SettingsSection>
          
          <SettingsSection title="SMTP Settings" description="Configure your SMTP server details">
            <SmtpSettings form={form} />
          </SettingsSection>
          
          <SettingsSection title="Sender Information" description="Configure the sender information for outgoing emails">
            <SenderSettings form={form} />
          </SettingsSection>
          
          <SettingsSection title="Email Notifications" description="Control when emails are sent">
            <NotificationSettings form={form} />
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default EmailSettings;
