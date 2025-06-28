
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import TaskGroup from './TaskGroup';
import { useAgendaData } from './agendaUtils';

const AgendaContent: React.FC = () => {
  const { todayTasks, upcomingTasks, overdueTasks, isLoading } = useAgendaData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Today's Agenda
          </h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {todayTasks.length} Today
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {upcomingTasks.length} Upcoming
          </Badge>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <TaskGroup
          title="Overdue Tasks"
          tasks={overdueTasks}
          badgeVariant="destructive"
        />
      )}

      <TaskGroup
        title="Today's Tasks"
        tasks={todayTasks}
        badgeVariant="default"
      />

      <TaskGroup
        title="Upcoming Tasks"
        tasks={upcomingTasks}
        badgeVariant="secondary"
      />
    </div>
  );
};

export default AgendaContent;
