
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "./DashboardMetrics";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface MobileDashboardProps {
  dashboardData: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ dashboardData }) => {
  const navigate = useNavigate();
  
  // Get upcoming tasks, limited to 3 for mobile view
  const upcomingTasks = dashboardData.upcomingTasks?.slice(0, 3) || [];
  
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <DashboardMetrics data={dashboardData} />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
          onClick={() => navigate('/housekeeping')}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-condensed">View Tasks</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="border-dashed border-2 h-24 flex flex-col items-center justify-center gap-1"
          onClick={() => navigate('/maintenance')}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <span className="text-sm font-condensed">Maintenance</span>
        </Button>
      </div>
      
      {/* Upcoming Tasks Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base mobile-heading">Today's Tasks</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/housekeeping')}>
              <span className="font-condensed text-sm tracking-tight">View All</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    index < upcomingTasks.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm mobile-text">{task.title}</p>
                    <p className="text-xs text-muted-foreground font-condensed">{task.property}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={task.priority === "high" ? "destructive" : 
                      task.priority === "medium" ? "default" : "outline"}>
                      <span className="font-condensed text-xs tracking-tight">{task.dueDate}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6 font-condensed">No tasks scheduled for today.</p>
          )}
        </CardContent>
      </Card>
      
      <Separator />
      
      {/* Offline Indicator and Sync Button */}
      <div className="bg-muted p-4 rounded-md text-center space-y-2">
        <p className="text-sm font-medium">All data synced</p>
        <p className="text-xs text-muted-foreground font-condensed">You're good to go!</p>
      </div>
    </div>
  );
};

export default MobileDashboard;
