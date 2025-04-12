
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Signal, History } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PropertyFilter } from '@/contexts/AnalyticsContext';

// Sample activity data for demonstration with properly typed status values
const activityData = [
  { id: 1, type: "login", user: "Maria Karapataki", time: "Today, 08:23 AM", status: "success" as const, property: "Villa Caldera" },
  { id: 2, type: "task_completion", user: "Nikos Papadopoulos", time: "Today, 09:45 AM", status: "success" as const, property: "Villa Sunset" },
  { id: 3, type: "inventory_update", user: "Elena Andreou", time: "Today, 10:12 AM", status: "warning" as const, property: "Villa Oceana" },
  { id: 4, type: "booking_change", user: "System", time: "Today, 11:30 AM", status: "info" as const, property: "Villa Paradiso" },
  { id: 5, type: "maintenance_request", user: "George Demetriou", time: "Today, 01:15 PM", status: "error" as const, property: "Villa Azure" },
  { id: 6, type: "login", user: "Alex Ioannou", time: "Today, 02:40 PM", status: "success" as const, property: "Villa Caldera" },
];

interface ActivityMonitorProps {
  limit?: number;
  propertyFilter?: PropertyFilter;
}

export const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ limit = 5, propertyFilter = 'all' }) => {
  const isMobile = useIsMobile();
  
  // Filter activities by property if a specific property is selected
  const filteredActivity = propertyFilter === 'all' 
    ? activityData 
    : activityData.filter(activity => activity.property === propertyFilter);
  
  // Apply the limit after filtering
  const limitedActivity = filteredActivity.slice(0, limit);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              {propertyFilter === 'all' 
                ? 'System and user activities across all villas' 
                : `System and user activities for ${propertyFilter}`}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 24hrs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {limitedActivity.length > 0 ? (
            limitedActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent activity for this property</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  activity: {
    id: number;
    type: string;
    user: string;
    time: string;
    status: "success" | "warning" | "error" | "info";
    property: string;
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <Signal className="h-4 w-4 text-blue-500" />;
      case "task_completion":
        return <History className="h-4 w-4 text-green-500" />;
      case "inventory_update":
        return <Activity className="h-4 w-4 text-amber-500" />;
      case "booking_change":
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-red-500" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "destructive";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };
  
  const getActivityText = (type: string) => {
    switch (type) {
      case "login":
        return "Logged into system";
      case "task_completion":
        return "Completed a task";
      case "inventory_update":
        return "Updated inventory";
      case "booking_change":
        return "Booking modified";
      case "maintenance_request":
        return "Requested maintenance";
      default:
        return "Performed an action";
    }
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0 last:pb-0">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {activity.user}
          <span className="text-muted-foreground font-normal ml-1">
            {getActivityText(activity.type)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {activity.time}
        </p>
      </div>
      <Badge variant={getBadgeVariant(activity.status)} className="text-[10px] h-5">
        {activity.status}
      </Badge>
    </div>
  );
};
