
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";

interface AirbnbSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const AirbnbSettings: React.FC<AirbnbSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="airbnbApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airbnb API Key</FormLabel>
            <FormControl>
              <Input type="password" {...field} value={field.value || ""} />
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
