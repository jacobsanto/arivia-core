
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface BookingComSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const BookingComSettings: React.FC<BookingComSettingsProps> = ({ form }) => {
  const isEnabled = form.watch("bookingComEnabled");

  // Reset API key when disabled
  React.useEffect(() => {
    if (!isEnabled && form.getValues("bookingComApiKey") !== "") {
      form.setValue("bookingComApiKey", "", { shouldValidate: false });
      toast.info("Booking.com credentials cleared", {
        description: "API credentials have been removed as integration was disabled"
      });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert className="mt-4 bg-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Booking.com integration is currently disabled. Enable it to sync with Booking.com.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="bookingComApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Booking.com API Key <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Enter your Booking.com API key"
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  form.trigger("bookingComApiKey");
                }}
              />
            </FormControl>
            <FormDescription>
              Your API Key from the Booking.com Partner Central
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BookingComSettings;
