
import React, { useState } from "react";
import { MaintenanceOverview } from "@/components/maintenance/MaintenanceOverview";
import { MaintenanceTaskManagement } from "@/components/maintenance/MaintenanceTaskManagement";
import MaintenanceViewModes from "@/components/maintenance/MaintenanceViewModes";
import { MaintenanceErrorBoundary } from "@/components/error-boundaries/MaintenanceErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CreateMaintenanceTaskDialog } from "@/components/maintenance/CreateMaintenanceTaskDialog";
import { TaskCreationDialog } from "@/components/tasks/TaskCreationDialog";
import { toastService } from "@/services/toast";
import { Plus, Wrench, Bed } from "lucide-react";

const Maintenance: React.FC = () => {
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isCreateHousekeepingOpen, setIsCreateHousekeepingOpen] = useState(false);

  return (
    <MaintenanceErrorBoundary>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              Maintenance Operations
            </h1>
            <p className="text-muted-foreground">Manage maintenance operations and tasks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateMaintenanceOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Maintenance Task
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsCreateHousekeepingOpen(true)}
              className="flex items-center gap-2"
            >
              <Bed className="h-4 w-4" />
              Create Housekeeping Request
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
            <MaintenanceOverview />
          </TabsContent>
          
          <TabsContent value="tasks">
            <MaintenanceTaskManagement />
          </TabsContent>
          
          <TabsContent value="views">
            <MaintenanceViewModes />
          </TabsContent>
        </Tabs>

        {/* Task Creation Dialogs */}
        <CreateMaintenanceTaskDialog
          isOpen={isCreateMaintenanceOpen}
          onOpenChange={setIsCreateMaintenanceOpen}
          onTaskCreated={() => {
            toastService.success('Maintenance task created successfully!');
          }}
        />

        <TaskCreationDialog 
          isOpen={isCreateHousekeepingOpen}
          onOpenChange={setIsCreateHousekeepingOpen}
          defaultTab="housekeeping"
        />
      </div>
    </MaintenanceErrorBoundary>
  );
};

export default Maintenance;
