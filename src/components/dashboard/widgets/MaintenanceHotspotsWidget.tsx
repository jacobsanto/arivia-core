import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wrench } from "lucide-react";

// Mock data for maintenance hotspots
const maintenanceHotspots = [
  {
    id: '1',
    property: 'Ocean View Villa',
    openIssues: 5,
    lastIssue: '2 hours ago',
    commonIssue: 'HVAC System'
  },
  {
    id: '2',
    property: 'Beach House',
    openIssues: 3,
    lastIssue: '1 day ago',
    commonIssue: 'Plumbing'
  },
  {
    id: '3',
    property: 'Garden Villa',
    openIssues: 2,
    lastIssue: '3 days ago',
    commonIssue: 'Pool Equipment'
  }
];

export const MaintenanceHotspotsWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Maintenance Hotspots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {maintenanceHotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm">{hotspot.property}</h4>
                  <p className="text-xs text-muted-foreground">
                    Common: {hotspot.commonIssue} • Last: {hotspot.lastIssue}
                  </p>
                </div>
              </div>
              
              <Badge variant={hotspot.openIssues > 3 ? "destructive" : "secondary"}>
                {hotspot.openIssues} issues
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};