import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, 
  Wrench, 
  FileWarning, 
  Package,
  User
} from "lucide-react";

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task': return CheckCircle;
    case 'maintenance': return Wrench;
    case 'damage': return FileWarning;
    case 'inventory': return Package;
    default: return User;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'task': return 'text-green-600';
    case 'maintenance': return 'text-blue-600';
    case 'damage': return 'text-red-600';
    case 'inventory': return 'text-orange-600';
    default: return 'text-gray-600';
  }
};

export const RecentActivityWidget: React.FC = () => {
  const { recentActivity, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!recentActivity || recentActivity.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2">
                  <ActivityIcon className={`h-4 w-4 mt-1 ${iconColor}`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}
                      <span>{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};