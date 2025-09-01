import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSystemSettingsManager } from "@/hooks/useSystemSettingsManager";
import EnhancedGeneralSettings from "@/components/settings/sections/enhanced-general/EnhancedGeneralSettings";
import BrandingSettings from "@/components/settings/sections/branding/BrandingSettings";
import EnhancedSecuritySettings from "@/components/settings/sections/enhanced-security/EnhancedSecuritySettings";
import OperationalSettings from "@/components/settings/sections/operational/OperationalSettings";

const SystemSettings: React.FC = () => {
  const {
    form,
    isLoading,
    isSaving,
    hasChanges,
    updatedAt,
    onSave,
    onReset,
  } = useSystemSettingsManager();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>System Settings - Arivia Core</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Global Action Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
              <p className="text-muted-foreground mt-2">
                Configure the global behavior, appearance, and core business rules of the application
              </p>
              {updatedAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onReset}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          
          {hasChanges && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You have unsaved changes. Click "Save Changes" to apply or "Cancel" to discard.
              </p>
            </div>
          )}
        </div>

        <Form {...form}>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-8 pr-4">
              <EnhancedGeneralSettings form={form} />
              <BrandingSettings form={form} />
              <EnhancedSecuritySettings form={form} />
              <OperationalSettings form={form} />
            </div>
          </ScrollArea>
        </Form>
      </div>
    </>
  );
};

export default SystemSettings;