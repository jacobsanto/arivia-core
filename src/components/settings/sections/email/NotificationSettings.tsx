
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { EmailSettingsFormValues } from "./types";

interface NotificationSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="enableEmailNotifications"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Enable Email Notifications</FormLabel>
            <FormDescription>
              Send automatic email notifications for important events
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
  );
};

export default NotificationSettings;
