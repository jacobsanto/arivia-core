
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import GuestyIntegration from "./integrations/guesty/GuestyIntegration";

const IntegrationSettings = () => {
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
                <h3 className="font-medium mb-1">Configuring Integrations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with external services to extend your application's functionality.
                  Currently supporting Guesty for property management integration.
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <GuestyIntegration />
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
