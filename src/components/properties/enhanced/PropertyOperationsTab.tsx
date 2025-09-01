import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Clock, 
  User,
  Plus
} from "lucide-react";

interface PropertyOperationsTabProps {
  propertyId: string;
}

export const PropertyOperationsTab: React.FC<PropertyOperationsTabProps> = ({ propertyId }) => {
  // Mock data - would be fetched based on propertyId
  const mockTasks = [
    {
      id: '1',
      type: 'housekeeping',
      title: 'Deep Clean Master Bedroom',
      status: 'pending',
      priority: 'high',
      assignee: 'Maria Garcia',
      dueDate: new Date().toISOString()
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Fix Pool Pump',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'John Smith',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Operations Tasks</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="space-y-4">
        {mockTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={task.type === 'housekeeping' ? 'default' : 'secondary'}>
                      {task.type}
                    </Badge>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                      {task.priority}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {task.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge variant={task.status === 'pending' ? 'destructive' : 'default'}>
                  {task.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};