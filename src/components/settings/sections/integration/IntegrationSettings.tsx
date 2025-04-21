
import React from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";

/**
 * This is the Integration Settings page.
 * All third-party integrations (Guesty, Booking.com, Airbnb, Stripe) have been removed.
 * The section remains to support future integrations.
 */

const IntegrationSettings: React.FC = () => {
  return (
    <SettingsLayout
      title="Integration Settings"
      description="Configure third-party service integrations. No integrations are currently available."
      isLoading={false}
      isSaving={false}
      isDirty={false}
      onSave={() => {}}
      onReset={() => {}}
    >
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No integrations are currently set up.</p>
        <p className="text-sm mt-2">You can add integrations (e.g. Guesty, Booking.com, Airbnb, Stripe) in the future.</p>
      </div>
    </SettingsLayout>
  );
};

export default IntegrationSettings;
