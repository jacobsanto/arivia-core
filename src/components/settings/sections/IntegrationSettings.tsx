
import React from "react";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { integrationSettingsSchema, defaultIntegrationValues, IntegrationSettingsFormValues } from "./integration/types";
import IntegrationToggle from "./integration/IntegrationToggle";
import GuestySettings from "./integration/GuestySettings";
import BookingComSettings from "./integration/BookingComSettings";
import AirbnbSettings from "./integration/AirbnbSettings";
import StripeSettings from "./integration/StripeSettings";

const IntegrationSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    isDirty,
    onSubmit,
    resetForm,
  } = useSettingsForm<IntegrationSettingsFormValues>({
    category: 'integration',
    defaultValues: defaultIntegrationValues,
    schema: integrationSettingsSchema,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsLayout
          title="Integration Settings"
          description="Configure third-party service integrations"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(onSubmit)}
          onReset={resetForm}
        >
          <SettingsSection
            title="Guesty Integration"
            description="Connect to Guesty for property and booking management"
          >
            <IntegrationToggle
              form={form}
              name="guestyApiEnabled"
              label="Enable Guesty Integration"
              description="Connect to Guesty for property and booking management"
            />
            {form.watch("guestyApiEnabled") && <GuestySettings form={form} />}
          </SettingsSection>

          <SettingsSection
            title="Booking.com Integration"
            description="Connect to Booking.com for channel management"
          >
            <IntegrationToggle
              form={form}
              name="bookingComEnabled"
              label="Enable Booking.com Integration"
              description="Connect to Booking.com for channel management"
            />
            {form.watch("bookingComEnabled") && <BookingComSettings form={form} />}
          </SettingsSection>

          <SettingsSection
            title="Airbnb Integration"
            description="Connect to Airbnb for channel management"
          >
            <IntegrationToggle
              form={form}
              name="airbnbEnabled"
              label="Enable Airbnb Integration"
              description="Connect to Airbnb for channel management"
            />
            {form.watch("airbnbEnabled") && <AirbnbSettings form={form} />}
          </SettingsSection>

          <SettingsSection
            title="Payment Integration"
            description="Connect to Stripe for payment processing"
          >
            <IntegrationToggle
              form={form}
              name="stripeEnabled"
              label="Enable Stripe Integration"
              description="Connect to Stripe for payment processing"
            />
            {form.watch("stripeEnabled") && <StripeSettings form={form} />}
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default IntegrationSettings;
