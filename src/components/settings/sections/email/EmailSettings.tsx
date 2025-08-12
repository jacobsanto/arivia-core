import React from "react";
import { Form } from "@/components/ui/form";
import SettingsCard from "@/components/settings/SettingsCard";
import ProviderSettings from "./ProviderSettings";
import SmtpSettings from "./SmtpSettings";
import SenderSettings from "./SenderSettings";
import NotificationSettings from "./NotificationSettings";
import { useSystemSettingsForm } from "@/hooks/useSystemSettingsForm";
import { emailSettingsSchema, defaultEmailValues, EmailSettingsFormValues } from "./types";

const EmailSettings: React.FC = () => {
  const { form, isLoading, isSaving, onSubmit, resetForm } = useSystemSettingsForm<EmailSettingsFormValues>({
    category: "email",
    defaultValues: defaultEmailValues,
    schema: emailSettingsSchema,
  });

  return (
    <Form {...form}>
      <SettingsCard
        title="Email Configuration"
        description="Set up your email provider, sender identity, and notifications."
        isLoading={isLoading}
        isSaving={isSaving}
        onSave={() => form.handleSubmit(onSubmit)()}
        onReset={resetForm}
      >
        <div className="space-y-6">
          <ProviderSettings form={form} />
          <SmtpSettings form={form} />
          <SenderSettings form={form} />
          <NotificationSettings form={form} />
        </div>
      </SettingsCard>
    </Form>
  );
};

export default EmailSettings;
