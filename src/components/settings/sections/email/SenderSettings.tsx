
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmailSettingsFormValues } from "./types";

interface SenderSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const SenderSettings: React.FC<SenderSettingsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="fromEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>From Email Address</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="no-reply@arivia-villas.com" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Email address that will appear as the sender
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
              <Input 
                placeholder="Arivia Villas" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Name that will appear as the sender
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SenderSettings;
