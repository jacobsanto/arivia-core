
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";

interface BookingComSettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const BookingComSettings: React.FC<BookingComSettingsProps> = ({ form }) => {
  return (
    <div className="space-y-4 mt-4">
      <FormField
        control={form.control}
        name="bookingComApiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Booking.com API Key</FormLabel>
            <FormControl>
              <Input type="password" {...field} value={field.value || ""} />
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
