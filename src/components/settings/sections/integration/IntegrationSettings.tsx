
import React, { useState } from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const IntegrationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [guestyEnabled, setGuestyEnabled] = useState(false);
  const [guestyUsername, setGuestyUsername] = useState("");
  const [guestyClientId, setGuestyClientId] = useState("");
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      // This would typically save to a backend or environment variables
      // For now we just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Integration settings saved", {
        description: "Your changes have been saved successfully"
      });
      
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setGuestyEnabled(false);
    setGuestyUsername("");
    setGuestyClientId("");
    setIsDirty(false);
  };
  
  const handleFieldChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  return (
    <SettingsLayout
      title="Integration Settings"
      description="Configure third-party service integrations for Arivia Villas."
      isLoading={isLoading}
      isSaving={isLoading}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
    >
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Guesty Integration</CardTitle>
              <CardDescription>Connect your Guesty account to import properties and bookings</CardDescription>
            </div>
            <Switch 
              checked={guestyEnabled} 
              onCheckedChange={(checked) => {
                setGuestyEnabled(checked);
                handleFieldChange();
              }} 
              aria-label="Enable Guesty integration"
            />
          </div>
        </CardHeader>
        
        <CardContent className={guestyEnabled ? "space-y-4" : "opacity-50 pointer-events-none space-y-4"}>
          <div>
            <Label htmlFor="guesty-username">Guesty Username/Email</Label>
            <Input
              id="guesty-username"
              value={guestyUsername}
              onChange={(e) => {
                setGuestyUsername(e.target.value);
                handleFieldChange();
              }}
              placeholder="Enter your Guesty username or email"
            />
          </div>
          
          <div>
            <Label htmlFor="guesty-client-id">Guesty Client ID</Label>
            <Input
              id="guesty-client-id"
              value={guestyClientId}
              onChange={(e) => {
                setGuestyClientId(e.target.value);
                handleFieldChange();
              }}
              placeholder="Enter your Guesty client ID"
            />
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Note: The remaining credentials (Client Secret and Password) must be configured in your Netlify environment variables for security reasons.
            </p>
          </div>
        </CardContent>
        
        {guestyEnabled && (
          <CardFooter className="border-t bg-muted/50 p-4">
            <div className="text-sm text-amber-600">
              <p className="font-semibold">Development Environment Notice:</p>
              <p>The Guesty API integration requires properly configured Netlify Functions which are not available in the local development environment. For production use, deploy to Netlify and configure the environment variables.</p>
            </div>
          </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Other Integrations</CardTitle>
              <CardDescription>Additional integrations will be available soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-medium">Booking.com</h4>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch disabled />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-medium">Airbnb</h4>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch disabled />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-medium">Stripe Payments</h4>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
};

export default IntegrationSettings;
