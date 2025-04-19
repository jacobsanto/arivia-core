
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface GuestySettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const GuestySettings: React.FC<GuestySettingsProps> = ({ form }) => {
  const isEnabled = form.watch("guestyApiEnabled");

  // Reset API credentials immediately when integration is disabled
  React.useEffect(() => {
    if (!isEnabled && form.getValues("guestyApiKey") !== "" || form.getValues("guestyApiSecret") !== "") {
      form.setValue("guestyApiKey", "", { shouldValidate: false });
      form.setValue("guestyApiSecret", "", { shouldValidate: false });
      toast.info("Guesty credentials cleared", {
        description: "API credentials have been removed as integration was disabled"
      });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert className="mt-4 bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Guesty integration is currently disabled. Enable it to manage properties and bookings through Guesty.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="guestyApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guesty API Key <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Guesty API key"
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("guestyApiKey");
                }}
              />
            </FormControl>
            <FormDescription>
              Your Guesty API Key from the Guesty developer portal
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="guestyApiSecret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guesty API Secret <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Guesty API secret"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("guestyApiSecret");
                }}
              />
            </FormControl>
            <FormDescription>
              Your Guesty API Secret from the Guesty developer portal
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default GuestySettings;
