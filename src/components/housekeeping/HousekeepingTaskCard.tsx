
import React, { useState } from "react";
import { format } from "date-fns";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, User, Info, Edit } from "lucide-react";
import { TaskCardProps } from "@/types/housekeepingTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusStyles = cva("", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      done: "bg-green-100 text-green-800 border-green-300",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

const HousekeepingTaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onAssignTask,
  cleaningDefinitions,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);
  const [staffName, setStaffName] = useState(task.assigned_to || "");
  
  // Format due date
  const formattedDate = 
    task.due_date ? 
    format(new Date(task.due_date), 'MMM d, yyyy') : 
    'No date set';
  
  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus !== task.status) {
      await onStatusChange(task.id, newStatus);
    }
  };
  
  const handleAssignTask = async () => {
    if (staffName && staffName !== task.assigned_to) {
      await onAssignTask(task.id, staffName);
      setIsAssigningStaff(false);
    }
  };

  return (
    <Card className={`transition-all shadow hover:shadow-md mb-3 border-l-4 ${statusStyles({ status: task.status as any })}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-medium">
                    {task.task_type}
                  </Badge>
                  {cleaningDefinitions[task.task_type] && (
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="text-sm">{cleaningDefinitions[task.task_type] || 'No description available'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Badge variant={
            task.status === 'pending' ? 'outline' : 
            task.status === 'in-progress' ? 'secondary' : 
            'success'
          }>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 px-4">
        <div className="space-y-2">
          <div>
            <div className="font-semibold">{task.listing_id}</div>
            <div className="text-sm text-muted-foreground">Due: {formattedDate}</div>
          </div>
          
          <div className="flex justify-between items-center text-sm pt-2">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {task.assigned_to ? task.assigned_to : 'Unassigned'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {task.status !== 'done' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('done')}>
                      Mark as Done
                    </DropdownMenuItem>
                  )}
                  {task.status === 'pending' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('in-progress')}>
                      Start Task
                    </DropdownMenuItem>
                  )}
                  {task.status === 'in-progress' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('pending')}>
                      Move to Pending
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsAssigningStaff(true)}>
                    Assign Staff
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Staff Assignment Dialog */}
      <Dialog open={isAssigningStaff} onOpenChange={setIsAssigningStaff}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
            <DialogDescription>
              Assign a staff member to this housekeeping task
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                value={staffName} 
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Enter staff name"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssigningStaff(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTask}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Task Type</h4>
                <p className="font-medium">{task.task_type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <p className="font-medium capitalize">{task.status}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Property</h4>
                <p className="font-medium">{task.listing_id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                <p className="font-medium">{task.assigned_to || "Unassigned"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Booking ID</h4>
                <p className="font-medium">{task.booking_id || "N/A"}</p>
              </div>
            </div>
            
            {cleaningDefinitions[task.task_type] && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm p-3 bg-muted rounded-md">{cleaningDefinitions[task.task_type]}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              {task.status !== 'done' && (
                <Button onClick={() => {
                  handleStatusUpdate('done');
                  setIsDialogOpen(false);
                }}>
                  Mark as Done
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HousekeepingTaskCard;
