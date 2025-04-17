
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Separator } from "@/components/ui/separator";
import RegistrationSettings from "./user-management/RegistrationSettings";
import PasswordSettings from "./user-management/PasswordSettings";
import SessionSettings from "./user-management/SessionSettings";
import { userManagementSchema, UserManagementFormValues, defaultUserManagementValues } from "./user-management/types";

const UserManagementSettings: React.FC = () => {
  // Use system settings hook to interact with the database
  const { settings, saveSettings, isLoading, isSaving } = useSystemSettings<UserManagementFormValues>(
    'user-management',
    defaultUserManagementValues
  );

  const form = useForm<UserManagementFormValues>({
    resolver: zodResolver(userManagementSchema),
    defaultValues: settings, // Use settings from the database
  });

  // Update form values when settings are loaded from database
  useEffect(() => {
    if (!isLoading) {
      form.reset(settings);
    }
  }, [form, settings, isLoading]);

  // Handle form submission
  async function onSubmit(data: UserManagementFormValues) {
    try {
      await saveSettings(data);
      toast.success("User management settings updated", {
        description: "Your changes have been saved."
      });
    } catch (error) {
      console.error("Failed to save user management settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again."
      });
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsCard 
          title="User Management" 
          description="Configure user registration and access settings"
          isLoading={isLoading}
          isSaving={isSaving}
          onSave={form.handleSubmit(onSubmit)}
          onReset={handleReset}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Registration</h3>
              <p className="text-sm text-muted-foreground">
                Configure how users can register for the system
              </p>
              <div className="mt-3">
                <RegistrationSettings form={form} />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Password Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Set password complexity requirements
              </p>
              <div className="mt-3">
                <PasswordSettings form={form} />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Session Management</h3>
              <p className="text-sm text-muted-foreground">
                Configure session timeouts and behavior
              </p>
              <div className="mt-3">
                <SessionSettings form={form} />
              </div>
            </div>
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};

export default UserManagementSettings;
