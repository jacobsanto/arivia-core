
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import SettingsCard from "../SettingsCard";

const integrationSchema = z.object({
  guestyApiEnabled: z.boolean(),
  guestyApiKey: z.string().min(1, "API key is required").optional(),
  guestyApiSecret: z.string().min(1, "API secret is required").optional(),
  bookingComEnabled: z.boolean(),
  bookingComApiKey: z.string().optional(),
  airbnbEnabled: z.boolean(),
  airbnbApiKey: z.string().optional(),
  stripeEnabled: z.boolean(),
  stripeApiKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

const IntegrationSettings: React.FC = () => {
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      guestyApiEnabled: true,
      guestyApiKey: "guesty_api_key_placeholder",
      guestyApiSecret: "guesty_api_secret_placeholder",
      bookingComEnabled: false,
      airbnbEnabled: false,
      stripeEnabled: false,
    },
  });

  function onSubmit(data: IntegrationFormValues) {
    toast.success("Integration settings updated", {
      description: "Your changes have been saved."
    });
    console.log("Integration settings saved:", data);
  }

  const watchGuestyEnabled = form.watch("guestyApiEnabled");
  const watchBookingEnabled = form.watch("bookingComEnabled");
  const watchAirbnbEnabled = form.watch("airbnbEnabled");
  const watchStripeEnabled = form.watch("stripeEnabled");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsCard 
          title="Integration Settings" 
          description="Configure third-party service integrations"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Guesty Integration</h3>
              
              <FormField
                control={form.control}
                name="guestyApiEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Guesty Integration</FormLabel>
                      <FormDescription>
                        Connect to Guesty for property and booking management
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchGuestyEnabled && (
                <>
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
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Booking.com Integration</h3>
              
              <FormField
                control={form.control}
                name="bookingComEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Booking.com Integration</FormLabel>
                      <FormDescription>
                        Connect to Booking.com for channel management
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchBookingEnabled && (
                <FormField
                  control={form.control}
                  name="bookingComApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking.com API Key</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your API key from the Booking.com Connectivity Partners platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Airbnb Integration</h3>
              
              <FormField
                control={form.control}
                name="airbnbEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Airbnb Integration</FormLabel>
                      <FormDescription>
                        Connect to Airbnb for channel management
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchAirbnbEnabled && (
                <FormField
                  control={form.control}
                  name="airbnbApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Airbnb API Key</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your API key from the Airbnb developer platform
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Integration</h3>
              
              <FormField
                control={form.control}
                name="stripeEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Stripe Integration</FormLabel>
                      <FormDescription>
                        Connect to Stripe for payment processing
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchStripeEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="stripeApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe API Key</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Stripe Secret Key
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stripeWebhookSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Webhook Secret</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Stripe Webhook Secret for event handling
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};

export default IntegrationSettings;
