
import React from "react";
import { Form } from "@/components/ui/form";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSection from "@/components/settings/SettingsSection";
import { integrationSettingsSchema, defaultIntegrationValues, IntegrationSettingsFormValues } from "./types";
import IntegrationToggle from "./IntegrationToggle";
import GuestySettings from "./GuestySettings";
import BookingComSettings from "./BookingComSettings";
import AirbnbSettings from "./AirbnbSettings";
import StripeSettings from "./StripeSettings";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const IntegrationSettings: React.FC = () => {
  const [hasFormErrors, setHasFormErrors] = React.useState(false);
  const [showNetlifyInfo, setShowNetlifyInfo] = React.useState(false);

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

  // Check for form errors when form state changes
  React.useEffect(() => {
    const hasErrors = Object.keys(form.formState.errors).length > 0;
    
    if (hasErrors) {
      console.log("Form has errors:", form.formState.errors);
      setHasFormErrors(true);
    } else {
      setHasFormErrors(false);
    }
  }, [form.formState.errors]);

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

  const openNetlifyDocs = () => {
    window.open('https://docs.netlify.com/environment-variables/overview/', '_blank');
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

          <Card className="p-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <img 
                  src="https://www.netlify.com/v3/img/components/logomark.png" 
                  alt="Netlify logo" 
                  className="w-8 h-8" 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Netlify Deployment Settings</h3>
                  <Badge className="bg-blue-500">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This app is configured to run on Netlify. You'll need to set up environment variables in your Netlify dashboard.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={openNetlifyDocs}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Netlify Docs
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowNetlifyInfo(!showNetlifyInfo)}
                  >
                    {showNetlifyInfo ? "Hide Details" : "Show Required Env Variables"}
                  </Button>
                </div>

                {showNetlifyInfo && (
                  <Alert className="mt-3 bg-slate-50">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <p className="font-semibold mb-1">Required Environment Variables for Netlify:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><code>GUESTY_CLIENT_ID</code> - OAuth client ID from Guesty</li>
                        <li><code>GUESTY_SECRET</code> - OAuth client secret from Guesty</li>
                        <li><code>GUESTY_USERNAME</code> - Guesty account username</li>
                        <li><code>GUESTY_PASSWORD</code> - Guesty account password</li>
                        <li><code>STRIPE_SECRET_KEY</code> - Your Stripe secret API key</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </Card>

          <SettingsSection
            title="Guesty Integration"
            description="Connect to Guesty for property and booking management"
          >
            <IntegrationToggle
              form={form}
              name="guestyApiEnabled"
              label="Enable Guesty Integration"
              description="Connect to Guesty for property and booking management"
              showConfirmation={true}
              onBeforeToggle={async (newValue) => {
                // If enabling, no confirmation needed
                if (newValue) return true;
                
                // If disabling, show confirmation dialog
                return new Promise((resolve) => {
                  const confirmed = window.confirm(
                    "Are you sure you want to disable Guesty integration? This will clear your API credentials."
                  );
                  resolve(confirmed);
                });
              }}
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
