
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EmailSettingsFormValues } from "./types";

interface ProviderSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="emailProvider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email Provider</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || "select-provider"}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="select-provider" disabled>Select provider</SelectItem>
              <SelectItem value="smtp">Custom SMTP</SelectItem>
              <SelectItem value="sendgrid">SendGrid</SelectItem>
              <SelectItem value="mailgun">Mailgun</SelectItem>
              <SelectItem value="ses">Amazon SES</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Choose your email delivery service
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProviderSettings;
