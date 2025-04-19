
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BookingComSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const BookingComSettings: React.FC<BookingComSettingsProps> = ({ form }) => {
  const isEnabled = form.watch("bookingComEnabled");

  // Reset API key when disabled
  React.useEffect(() => {
    if (!isEnabled) {
      form.setValue("bookingComApiKey", "", { shouldValidate: true });
    }
  }, [isEnabled, form]);

  if (!isEnabled) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
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
            <FormLabel>Booking.com API Key</FormLabel>
            <FormControl>
              <Input 
                type="password" 
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
