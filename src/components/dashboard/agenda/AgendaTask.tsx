
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, User } from "lucide-react";
import { Task } from "@/types/taskTypes";
import { format } from "date-fns";

interface AgendaTaskProps {
  task: Task;
  onComplete?: () => void;
  onToggleChecklistItem?: (itemId: string) => void;
  onClick?: () => void;
}

const AgendaTask: React.FC<AgendaTaskProps> = ({
  task,
  onComplete,
  onToggleChecklistItem,
  onClick
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "border-l-red-500 bg-red-50";
      case "High": return "border-l-orange-500 bg-orange-50";
      case "Medium": return "border-l-yellow-500 bg-yellow-50";
      case "Low": return "border-l-green-500 bg-green-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleChecklistToggle = (itemId: string) => {
    if (onToggleChecklistItem) {
      onToggleChecklistItem(itemId);
    }
  };

  const isCompleted = task.status === "Completed";
  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;

  return (
    <div 
      className={`border-l-4 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
          {task.priority && (
            <Badge variant="outline">
              {task.priority}
            </Badge>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-4">
          {task.assignedTo && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {task.assignedTo}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(typeof task.dueDate === 'string' ? new Date(task.dueDate) : new Date(task.dueDate), 'HH:mm')}
            </span>
          )}
        </div>
        {totalItems > 0 && (
          <span className="text-xs">
            {completedItems}/{totalItems} items completed
          </span>
        )}
      </div>

      {task.checklist.length > 0 && (
        <div className="space-y-2 mb-3">
          {task.checklist.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleChecklistToggle(item.id)}
                className="rounded"
              />
              <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : ''}`}>
                {item.title || item.text}
              </span>
            </div>
          ))}
          {task.checklist.length > 3 && (
            <p className="text-xs text-gray-500">
              +{task.checklist.length - 3} more items
            </p>
          )}
        </div>
      )}

      {!isCompleted && onComplete && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="w-full"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </Button>
      )}
    </div>
  );
};

export default AgendaTask;
