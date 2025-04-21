
import React, { useState } from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuestyIntegration from "./GuestyIntegration";

const IntegrationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("guesty");
  const [isDirty, setIsDirty] = useState(false);
  
  const handleSave = () => {
    // This will be handled by the individual integration components
    setIsDirty(false);
  };
  
  const handleReset = () => {
    // This will be handled by the individual integration components
    setIsDirty(false);
  };

  return (
    <SettingsLayout
      title="Integration Settings"
      description="Configure third-party service integrations for Arivia Villas."
      isLoading={false}
      isSaving={false}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect external services to enhance your operations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="guesty">Guesty</TabsTrigger>
              <TabsTrigger value="booking">Booking.com</TabsTrigger>
              <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guesty" className="space-y-4">
              <GuestyIntegration />
            </TabsContent>
            
            <TabsContent value="booking" className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium">Booking.com</h4>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch disabled />
              </div>
            </TabsContent>
            
            <TabsContent value="airbnb" className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium">Airbnb</h4>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch disabled />
              </div>
            </TabsContent>
            
            <TabsContent value="stripe" className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium">Stripe Payments</h4>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch disabled />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
};

export default IntegrationSettings;
