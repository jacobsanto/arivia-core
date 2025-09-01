import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";

// Mock data for team workload
const teamWorkloadData = [
  { name: 'Maria Garcia', tasks: 8, completed: 6 },
  { name: 'John Smith', tasks: 5, completed: 4 },
  { name: 'Sarah Wilson', tasks: 12, completed: 9 },
  { name: 'Mike Johnson', tasks: 3, completed: 3 },
  { name: 'Elena Rodriguez', tasks: 7, completed: 5 }
];

export const TeamWorkloadWidget: React.FC = () => {
  const totalTasks = teamWorkloadData.reduce((sum, member) => sum + member.tasks, 0);
  const completedTasks = teamWorkloadData.reduce((sum, member) => sum + member.completed, 0);
  const overloadedMembers = teamWorkloadData.filter(member => member.tasks > 8).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Team Workload
          </div>
          <Badge variant="outline">
            {completedTasks}/{totalTasks} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamWorkloadData} layout="horizontal">
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
            <span className="font-medium">{teamWorkloadData.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overloaded:</span>
            <span className="font-medium">{overloadedMembers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};