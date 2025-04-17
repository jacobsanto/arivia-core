
import React from "react";
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmailSettingsFormValues } from "./types";

interface SenderSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const SenderSettings: React.FC<SenderSettingsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="fromEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>From Email</FormLabel>
            <FormControl>
              <Input placeholder="no-reply@arivia-villas.com" {...field} />
            </FormControl>
            <FormDescription>
              Email address that will appear in the "From" field
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="fromName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>From Name</FormLabel>
            <FormControl>
              <Input placeholder="Arivia Villas" {...field} />
            </FormControl>
            <FormDescription>
              Name that will appear in the "From" field
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SenderSettings;
