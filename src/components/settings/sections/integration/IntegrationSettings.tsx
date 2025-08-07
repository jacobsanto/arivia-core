
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Settings, Store, Link } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import GuestyIntegration from "./integrations/guesty/GuestyIntegration";
import IntegrationMarketplace from "./integrations/IntegrationMarketplace";
import IntegrationSetupDialog from "./integrations/IntegrationSetupDialog";
import ConnectedIntegrationsList from "./integrations/ConnectedIntegrationsList";

const IntegrationSettings = () => {
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const handleSetupIntegration = (config: any) => {
    setSelectedConfig(config);
    setSetupDialogOpen(true);
  };

  const handleSetupSuccess = () => {
    // Optionally switch to connected integrations tab
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Integration Platform</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with external services to extend your application's functionality.
                  Browse our integration marketplace or manage your existing connections.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="connected" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Connected
              </TabsTrigger>
              <TabsTrigger value="guesty" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Guesty
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="marketplace">
              <IntegrationMarketplace onSetupIntegration={handleSetupIntegration} />
            </TabsContent>
            
            <TabsContent value="connected">
              <ConnectedIntegrationsList />
            </TabsContent>
            
            <TabsContent value="guesty">
              <GuestyIntegration />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <IntegrationSetupDialog
        config={selectedConfig}
        open={setupDialogOpen}
        onOpenChange={setSetupDialogOpen}
        onSuccess={handleSetupSuccess}
      />
    </div>
  );
};

export default IntegrationSettings;
