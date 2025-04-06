
import React from 'react';
import { HelpCircle, Wifi, SmartphoneCharging, Sync, Image } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { offlineManager } from "@/utils/offlineManager";
import { toast } from "sonner";

const Troubleshooting = () => {
  const forceSyncData = () => {
    if (navigator.onLine) {
      toast.info("Starting manual sync...");
      offlineManager.syncOfflineData().then(() => {
        toast.success("Manual sync completed");
      });
    } else {
      toast.error("Cannot sync while offline", {
        description: "Please connect to the internet and try again."
      });
    }
  };

  const clearCache = () => {
    toast.info("Clearing cached data...");
    offlineManager.clearOfflineData();
    toast.success("Cache cleared successfully");
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <HelpCircle className="mr-2 h-7 w-7" /> Troubleshooting
        </h1>
        <p className="text-muted-foreground">
          Solutions to common issues you might encounter while using the application.
        </p>
      </div>

      <Alert>
        <AlertTitle>Need additional help?</AlertTitle>
        <AlertDescription>
          If you can't solve your issue with these troubleshooting steps, please contact
          our support team at <a href="mailto:support@ariviavillas.com" className="font-medium underline">support@ariviavillas.com</a>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-0" onClick={forceSyncData}>
                <Sync className="h-5 w-5 mr-2" /> Force Sync
              </Button>
              <Badge variant="outline" className="ml-auto">Recommended</Badge>
            </CardTitle>
            <CardDescription>Manually trigger data synchronization</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-0" onClick={clearCache}>
                <Image className="h-5 w-5 mr-2" /> Clear Cache
              </Button>
            </CardTitle>
            <CardDescription>Clear local data and cached images</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="login-problems">
          <AccordionTrigger className="font-medium">
            Login Problems
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="space-y-2">
              <p>If you're having trouble logging in:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you're using the correct email address and password</li>
                <li>Check your internet connection</li>
                <li>Try resetting your password</li>
                <li>Contact support if issues persist</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mobile-app-issues">
          <AccordionTrigger className="font-medium">
            Mobile App Issues
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="space-y-2">
              <p>For problems with the mobile application:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you have the latest version installed</li>
                <li>Check that your device meets the minimum requirements</li>
                <li>Try force-closing and reopening the app</li>
                <li>Clear the app cache in your device settings</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sync-problems">
          <AccordionTrigger className="font-medium">
            Sync Problems
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="space-y-2">
              <p>If you're experiencing synchronization issues:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Check your integration credentials</li>
                <li>Verify that the external platform is operational</li>
                <li>Try manually triggering a sync using the button above</li>
                <li>Contact support if sync fails repeatedly</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="photo-upload-failures">
          <AccordionTrigger className="font-medium">
            Photo Upload Failures
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="space-y-2">
              <p>If you're having trouble uploading photos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Check your internet connection</li>
                <li>Ensure you have granted camera and storage permissions</li>
                <li>Try reducing the photo resolution</li>
                <li>If on-site with poor connectivity, enable offline mode</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Connection Status</h3>
        <div className="flex items-center gap-2">
          <Wifi className={navigator.onLine ? "text-green-500" : "text-red-500"} />
          <span>{navigator.onLine ? "Online" : "Offline"}</span>
          {!navigator.onLine && (
            <Badge variant="outline" className="ml-2">
              Offline Mode Active
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {navigator.onLine 
            ? "You're connected to the internet. All features are available." 
            : "You're currently offline. Some features may be limited."}
        </p>
      </div>
    </div>
  );
};

export default Troubleshooting;
