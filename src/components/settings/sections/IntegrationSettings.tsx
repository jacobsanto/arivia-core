
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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const IntegrationSettings: React.FC = () => {
  const [hasFormErrors, setHasFormErrors] = React.useState(false);

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
    onAfterSave: (data) => {
      let enabledServices = [];
      if (data.guestyApiEnabled) enabledServices.push("Guesty");
      if (data.bookingComEnabled) enabledServices.push("Booking.com");
      if (data.airbnbEnabled) enabledServices.push("Airbnb");
      if (data.stripeEnabled) enabledServices.push("Stripe");
      
      if (enabledServices.length > 0) {
        toast.success(`Integration settings saved successfully`, {
          description: `Enabled services: ${enabledServices.join(", ")}`
        });
      } else {
        toast.success('All integrations are currently disabled');
      }
    },
  });

  // Check for form errors when validation is triggered
  React.useEffect(() => {
    const subscription = form.formState.subscribe(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log("Form has errors:", form.formState.errors);
        setHasFormErrors(true);
      } else {
        setHasFormErrors(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.formState]);

  const handleSubmit = async (data: IntegrationSettingsFormValues) => {
    console.log("Submitting integration settings:", data);
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to save integration settings:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support if the issue persists'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <SettingsLayout
          title="Integration Settings"
          description="Configure third-party service integrations"
          isLoading={isLoading}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={form.handleSubmit(handleSubmit)}
          onReset={resetForm}
        >
          {hasFormErrors && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors highlighted below before saving.
              </AlertDescription>
            </Alert>
          )}

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
            <GuestySettings form={form} />
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
            <BookingComSettings form={form} />
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
            <AirbnbSettings form={form} />
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
            <StripeSettings form={form} />
          </SettingsSection>
        </SettingsLayout>
      </form>
    </Form>
  );
};

export default IntegrationSettings;
