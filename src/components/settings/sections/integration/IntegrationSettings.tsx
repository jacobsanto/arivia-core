
import React from "react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

/**
 * Empty integration settings component
 * This is a placeholder for future integration implementations
 */
const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">Integration Settings</h3>
            <p className="text-sm text-muted-foreground">
              This section is under construction. Integration options will be available soon.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
