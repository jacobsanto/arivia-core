
import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TasksOverviewSectionProps {
  completedTasks: number;
  pendingTasks: number;
  criticalIssues: number;
}

export const TasksOverviewSection: React.FC<TasksOverviewSectionProps> = ({
  completedTasks,
  pendingTasks,
  criticalIssues
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold">{pendingTasks}</p>
        </div>
        <Clock className="h-8 w-8 text-amber-600" />
      </div>
      
      <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Critical Issues</p>
          <p className="text-2xl font-bold">{criticalIssues}</p>
        </div>
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
    </div>
  );
};
