
import React, { useState } from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const IntegrationSettings: React.FC = () => {
  return (
    <SettingsLayout
      title="Integration Settings"
      description="Configure third-party service integrations for Arivia Villas."
      isLoading={false}
      isSaving={false}
      isDirty={false}
      onSave={() => {}}
      onReset={() => {}}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Third-Party Integrations</CardTitle>
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
