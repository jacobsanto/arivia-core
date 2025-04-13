
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { TasksOverviewSection } from "../components/TasksOverviewSection";
import { UpcomingTasksList } from "../components/UpcomingTasksList";

interface TasksTabProps {
  dashboardData: any;
}

const TasksTab: React.FC<TasksTabProps> = ({ dashboardData }) => {
  return (
    <TabsContent value="tasks" className="space-y-5 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TasksOverviewSection 
            completedTasks={dashboardData.tasks?.completed || 0}
            pendingTasks={dashboardData.tasks?.pending || 0}
            criticalIssues={dashboardData.maintenance?.critical || 0}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingTasksList tasks={dashboardData.upcomingTasks || []} />
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default TasksTab;
