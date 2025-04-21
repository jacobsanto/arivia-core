import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { guestyService, GuestyCredentials } from '@/services/integrations/guesty.service';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuestyPropertyMapping from './GuestyPropertyMapping';

const formSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  enabled: z.boolean().default(false),
});

const GuestyIntegration = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'failed'>('untested');
  const [activeTab, setActiveTab] = useState("settings");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
      enabled: false,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await guestyService.getIntegrationSettings();
        if (settings) {
          form.reset({
            clientId: settings.clientId || "",
            clientSecret: settings.clientSecret || "",
            enabled: settings.enabled || false,
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Guesty settings:", error);
        setIsLoading(false);
        toast({
          title: "Error loading settings",
          description: "Failed to load Guesty integration settings",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const success = await guestyService.saveIntegrationSettings(values as GuestyCredentials);
      
      if (success) {
        toast({
          title: "Settings saved",
          description: "Guesty integration settings have been updated",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save Guesty settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save Guesty integration settings",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('untested');
    try {
      await guestyService.fetchListings(1, "0");
      setConnectionStatus('success');
      toast({
        title: "Connection successful",
        description: "Successfully connected to Guesty API",
      });
    } catch (error) {
      console.error("Failed to connect to Guesty:", error);
      setConnectionStatus('failed');
      toast({
        title: "Connection failed",
        description: "Failed to connect to Guesty API. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const isConfigured = form.getValues().clientId && form.getValues().clientSecret;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="settings">API Settings</TabsTrigger>
          <TabsTrigger value="properties" disabled={!isConfigured}>
            Property Mapping
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your Guesty Client ID" 
                          {...field} 
                          type="password"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Your Guesty API Client ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your Guesty Client Secret" 
                          {...field} 
                          type="password"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Your Guesty API Client Secret
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Guesty Integration</FormLabel>
                      <FormDescription>
                        Sync properties, bookings and availability with Guesty
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

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTesting || !form.getValues().clientId || !form.getValues().clientSecret}
                >
                  {isTesting ? (
                    <>Testing Connection...</>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </Form>

          {connectionStatus !== 'untested' && (
            <div className={`p-4 rounded-md ${
              connectionStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center">
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                <p>
                  {connectionStatus === 'success'
                    ? "Successfully connected to Guesty API"
                    : "Failed to connect to Guesty API. Please check your credentials."}
                </p>
              </div>
            </div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="pt-4">
              <Button 
                onClick={() => setActiveTab("properties")}
                className="w-full"
              >
                Continue to Property Mapping
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="properties">
          {!isConfigured && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded mb-4">
              <span>Please enter valid Guesty API credentials and save before mapping properties.</span>
            </div>
          )}
          {isConfigured && <GuestyPropertyMapping />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuestyIntegration;
