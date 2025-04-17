
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";

interface StripeSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="stripeApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stripe API Key</FormLabel>
            <FormControl>
              <Input type="password" {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Your Stripe API Secret Key
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="stripeWebhookSecret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stripe Webhook Secret</FormLabel>
            <FormControl>
              <Input type="password" {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Your Stripe Webhook Secret for event handling
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StripeSettings;
