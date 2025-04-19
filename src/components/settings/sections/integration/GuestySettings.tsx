
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GuestySettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const GuestySettings: React.FC<GuestySettingsProps> = ({ form }) => {
  const isEnabled = form.watch("guestyApiEnabled");

  if (!isEnabled) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
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
            <FormLabel>Guesty API Key</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
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
            <FormLabel>Guesty API Secret</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
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
