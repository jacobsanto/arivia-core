
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationSettingsFormValues } from "./types";

interface GuestySettingsProps {
  form: UseFormReturn<IntegrationSettingsFormValues>;
}

const GuestySettings: React.FC<GuestySettingsProps> = ({ form }) => {
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
