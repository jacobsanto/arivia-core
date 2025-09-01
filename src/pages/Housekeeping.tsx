
import React, { useState } from "react";
import { CleaningOverview } from "@/components/cleaning/CleaningOverview";
import { HousekeepingTaskManagement } from "@/components/housekeeping/HousekeepingTaskManagement";
import HousekeepingViewModes from "@/components/housekeeping/HousekeepingViewModes";
import { HousekeepingErrorBoundary } from "@/components/error-boundaries/HousekeepingErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CreateMaintenanceTaskDialog } from "@/components/maintenance/CreateMaintenanceTaskDialog";
import { TaskCreationDialog } from "@/components/tasks/TaskCreationDialog";
import { toastService } from "@/services/toast";
import { Plus, Bed, Wrench } from "lucide-react";

const Housekeeping: React.FC = () => {
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <HousekeepingErrorBoundary>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bed className="h-8 w-8 text-primary" />
              Housekeeping Operations
            </h1>
            <p className="text-muted-foreground">Manage cleaning operations and tasks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Housekeeping Task
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsCreateMaintenanceOpen(true)}
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Create Maintenance Request
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Operations Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
            <TabsTrigger value="views">Enhanced Views</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <CleaningOverview />
          </TabsContent>
          
          <TabsContent value="tasks">
            <HousekeepingTaskManagement />
          </TabsContent>
          
          <TabsContent value="views">
            <HousekeepingViewModes />
          </TabsContent>
        </Tabs>

        {/* Task Creation Dialogs */}
        <TaskCreationDialog 
          isOpen={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultTab="housekeeping"
        />

        <CreateMaintenanceTaskDialog
          isOpen={isCreateMaintenanceOpen}
          onOpenChange={setIsCreateMaintenanceOpen}
          onTaskCreated={() => {
            toastService.success('Maintenance request created successfully!');
          }}
        />
      </div>
    </HousekeepingErrorBoundary>
  );
};

export default Housekeeping;
