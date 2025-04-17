
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailSettingsFormValues } from "./types";

interface SmtpSettingsProps {
  form: UseFormReturn<EmailSettingsFormValues>;
}

const SmtpSettings: React.FC<SmtpSettingsProps> = ({ form }) => {
  const showSmtpSettings = form.watch("emailProvider") === "smtp";
  
  if (!showSmtpSettings) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="smtpHost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SMTP Host</FormLabel>
            <FormControl>
              <Input placeholder="smtp.example.com" {...field} />
            </FormControl>
            <FormDescription>
              The hostname of your SMTP server
            </FormDescription>
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
            <FormDescription>
              Common ports: 25, 465, 587, 2525
            </FormDescription>
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
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...field} 
              />
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Connection encryption type
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SmtpSettings;
