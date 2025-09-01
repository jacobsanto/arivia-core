import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  BedDouble,
  Wrench
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, isToday, isTomorrow } from "date-fns";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock;
    case 'in_progress': return AlertTriangle;
    case 'completed': return CheckCircle;
    default: return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'in_progress': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-red-500 text-red-700';
    case 'medium': return 'border-yellow-500 text-yellow-700';
    case 'low': return 'border-green-500 text-green-700';
    default: return 'border-gray-500 text-gray-700';
  }
};

export const MyTasksWidget: React.FC = () => {
  const navigate = useNavigate();
  const { myTasks, loading } = useDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayTasks = myTasks?.filter(task => 
    task.dueDate && isToday(new Date(task.dueDate))
  ) || [];

  const urgentTasks = myTasks?.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  ) || [];

  const displayTasks = [...urgentTasks, ...todayTasks]
    .filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          My Tasks
          <Badge variant="outline">
            {myTasks?.filter(t => t.status !== 'completed').length || 0} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p>All caught up! No urgent tasks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              const TaskIcon = task.type === 'housekeeping' ? BedDouble : Wrench;
              
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(task.type === 'housekeeping' ? '/housekeeping' : '/maintenance')}
                >
                  <TaskIcon className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.property}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>
                            {isToday(new Date(task.dueDate)) ? 'Today' :
                             isTomorrow(new Date(task.dueDate)) ? 'Tomorrow' :
                             format(new Date(task.dueDate), 'MMM dd')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/housekeeping')}
          >
            View All Tasks
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};