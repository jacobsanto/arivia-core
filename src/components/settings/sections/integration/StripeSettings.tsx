
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface StripeSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ form }) => {
  const isEnabled = form.watch("stripeEnabled");

  // Reset API credentials when disabled
  React.useEffect(() => {
    if (!isEnabled && (form.getValues("stripeApiKey") !== "" || form.getValues("stripeWebhookSecret") !== "")) {
      form.setValue("stripeApiKey", "", { shouldValidate: false });
      form.setValue("stripeWebhookSecret", "", { shouldValidate: false });
      toast.info("Stripe credentials cleared", {
        description: "API credentials have been removed as integration was disabled"
      });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert className="mt-4 bg-muted">
        <Info className="h-4 w-4" />
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
            <FormLabel>Stripe API Key <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Stripe API key"
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
            <FormLabel>Stripe Webhook Secret <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Stripe webhook secret"
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
