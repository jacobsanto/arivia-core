
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import SecurityChecksSection from "./security/SecurityChecksSection";
import AuthenticationSettings from "./security/AuthenticationSettings";
import AccountSecuritySettings from "./security/AccountSecuritySettings";
import IpRestrictionSettings from "./security/IpRestrictionSettings";
import EncryptionKeySettings from "./security/EncryptionKeySettings";
import { securitySchema, SecurityFormValues, defaultSecurityValues } from "./security/types";

const SecuritySettings: React.FC = () => {
  const { settings, saveSettings, isLoading } = useSystemSettings<SecurityFormValues>(
    'security', 
    defaultSecurityValues
  );

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: settings,
    values: settings
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (!isLoading) {
      Object.keys(settings).forEach(key => {
        form.setValue(key as keyof SecurityFormValues, 
          settings[key as keyof SecurityFormValues]);
      });
    }
  }, [settings, isLoading, form]);

  async function onSubmit(data: SecurityFormValues) {
    const success = await saveSettings(data);
    if (success) {
      form.reset(data);
    }
  }

  // Reset form to database values
  const handleReset = () => {
    form.reset(settings);
    toast.info("Form reset", {
      description: "Settings reverted to last saved values."
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsCard 
            title="Security Settings" 
            description="Configure system security and authentication options"
            isLoading={isLoading}
            isSaving={form.formState.isSubmitting}
            onSave={form.handleSubmit(onSubmit)}
            onReset={handleReset}
          >
            <div className="space-y-6">
              <SecurityChecksSection />
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure authentication settings for all users
                </p>
                <AuthenticationSettings form={form} />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Account Security</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure account security settings
                </p>
                <AccountSecuritySettings form={form} />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">IP Restrictions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Limit system access by IP address
                </p>
                <IpRestrictionSettings form={form} />
              </div>
              
              <Separator />
              
              <EncryptionKeySettings />
            </div>
          </SettingsCard>
        </form>
      </Form>
    </div>
  );
};

export default SecuritySettings;
