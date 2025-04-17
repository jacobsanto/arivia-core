
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EmailSettingsFormValues } from "./types";

interface SmtpSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const SmtpSettings: React.FC<SmtpSettingsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="smtpHost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SMTP Host</FormLabel>
            <FormControl>
              <Input placeholder="smtp.example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="smtpPort"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SMTP Port</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="587" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="smtpUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SMTP Username</FormLabel>
            <FormControl>
              <Input placeholder="username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="smtpPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SMTP Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="smtpEncryption"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Encryption</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SmtpSettings;
