import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

interface WorkloadData {
  name: string;
  tasks: number;
  completed: number;
}

export const TeamWorkloadWidget: React.FC = () => {
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamWorkload();
  }, []);

  const fetchTeamWorkload = async () => {
    try {
      // Get staff profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('role', ['housekeeping_staff', 'maintenance_staff']);

      if (!profiles) {
        setWorkloadData([]);
        return;
      }

      // Get task counts for each staff member
      const workloadPromises = profiles.map(async (profile) => {
        // Count housekeeping tasks
        const { count: housekeepingTotal } = await supabase
          .from('housekeeping_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', profile.user_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        const { count: housekeepingCompleted } = await supabase
          .from('housekeeping_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', profile.user_id)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        // Count maintenance tasks
        const { count: maintenanceTotal } = await supabase
          .from('maintenance_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', profile.user_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        const { count: maintenanceCompleted } = await supabase
          .from('maintenance_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', profile.user_id)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        const totalTasks = (housekeepingTotal || 0) + (maintenanceTotal || 0);
        const completedTasks = (housekeepingCompleted || 0) + (maintenanceCompleted || 0);

        return {
          name: profile.name.split(' ')[0], // First name only for display
          tasks: totalTasks,
          completed: completedTasks
        };
      });

      const workloadResults = await Promise.all(workloadPromises);
      
      // Filter out staff with no tasks and sort by total tasks
      const activeWorkload = workloadResults
        .filter(item => item.tasks > 0)
        .sort((a, b) => b.tasks - a.tasks)
        .slice(0, 8); // Show top 8 most active members

      setWorkloadData(activeWorkload);
    } catch (error) {
      logger.error('Error fetching team workload', error);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = workloadData.reduce((sum, member) => sum + member.tasks, 0);
  const completedTasks = workloadData.reduce((sum, member) => sum + member.completed, 0);
  const overloadedMembers = workloadData.filter(member => member.tasks > 8).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team Workload
            </div>
            <Badge variant="outline">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 mb-4 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Team Workload (7 days)
          </div>
          <Badge variant="outline">
            {completedTasks}/{totalTasks} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workloadData.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No active team members with tasks in the last 7 days
          </div>
        ) : (
          <>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="completed" 
                    fill="#10b981" 
                    name="Completed"
                  />
                  <Bar 
                    dataKey="tasks" 
                    fill="#e5e7eb" 
                    name="Total Tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Members:</span>
                <span className="font-medium">{workloadData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overloaded:</span>
                <span className="font-medium">{overloadedMembers}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};