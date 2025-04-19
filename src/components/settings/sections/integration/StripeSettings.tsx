
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StripeSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ form }) => {
  const isEnabled = form.watch("stripeEnabled");

  // Reset API credentials when disabled
  React.useEffect(() => {
    if (!isEnabled) {
      form.setValue("stripeApiKey", "", { shouldValidate: true });
      form.setValue("stripeWebhookSecret", "", { shouldValidate: true });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe integration is currently disabled. Enable it to process payments.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="stripeApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stripe API Key</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("stripeApiKey");
                }}
              />
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
              <Input 
                type="password" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("stripeWebhookSecret");
                }}
              />
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
