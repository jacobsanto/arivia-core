
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface AirbnbSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const AirbnbSettings: React.FC<AirbnbSettingsProps> = ({ form }) => {
  const isEnabled = form.watch("airbnbEnabled");

  // Reset API key when disabled
  React.useEffect(() => {
    if (!isEnabled && form.getValues("airbnbApiKey") !== "") {
      form.setValue("airbnbApiKey", "", { shouldValidate: false });
      toast.info("Airbnb credentials cleared", {
        description: "API credentials have been removed as integration was disabled"
      });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert className="mt-4 bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Airbnb integration is currently disabled. Enable it to sync with Airbnb.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="airbnbApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airbnb API Key <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Airbnb API key"
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("airbnbApiKey");
                }}
              />
            </FormControl>
            <FormDescription>
              Your API Key from the Airbnb Developer Portal
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AirbnbSettings;
