
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Users } from "lucide-react";

const SystemTab: React.FC = () => {
  return (
    <TabsContent value="system" className="space-y-5 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>System Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">High network latency detected</p>
                  <p className="text-xs text-muted-foreground">Notification service affected</p>
                </div>
              </div>
              <Badge variant="outline">Apr 10, 2025</Badge>
            </div>
            
            <div className="border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">System backup completed</p>
                  <p className="text-xs text-muted-foreground">Weekly backup successful</p>
                </div>
              </div>
              <Badge variant="outline">Apr 7, 2025</Badge>
            </div>

            <div className="border rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">New staff member onboarded</p>
                  <p className="text-xs text-muted-foreground">Housekeeping team</p>
                </div>
              </div>
              <Badge variant="outline">Apr 5, 2025</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Offline</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Sync</span>
              <span className="text-sm">Not available</span>
            </div>
            <div className="flex items-center justify-between">
              <span>External Services</span>
              <span className="text-sm">None configured</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SystemTab;
