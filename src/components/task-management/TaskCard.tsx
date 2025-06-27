import React from 'react';
import { Task } from "@/types/task-management";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCheck, Edit, Eye, MoreHorizontal, User } from "lucide-react";
import { format } from 'date-fns';
import { PriorityBadge } from '../ui/priority-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onView?: (task: Task) => void; // Add optional onView prop
  showActions?: boolean;
  isStaffView?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onComplete, 
  onEdit, 
  onView,
  showActions = true, 
  isStaffView = false 
}) => {
  const formattedDate = task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No Due Date';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{task.title}</CardTitle>
          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">Assigned to</div>
            <div className="text-xs text-muted-foreground">{task.assigned_to || 'Unassigned'}</div>
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary">Due Date: {formattedDate}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {!isStaffView && showActions ? (
          <>
            <Button variant="outline" size="sm" onClick={() => onComplete(task.id)}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button size="sm" onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Button>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Staff View</div>
        )}
        {onView && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(task)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
