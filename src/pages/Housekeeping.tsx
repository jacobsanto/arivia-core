
import React from "react";
import { CleaningOverview } from "@/components/cleaning/CleaningOverview";
import { MVPTaskManagement } from "@/components/tasks/mvp/MVPTaskManagement";
import { HousekeepingErrorBoundary } from "@/components/error-boundaries/HousekeepingErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Housekeeping: React.FC = () => {
  return (
    <HousekeepingErrorBoundary>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Housekeeping Operations</h1>
          <p className="text-muted-foreground">Manage cleaning operations and tasks</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Operations Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <CleaningOverview />
          </TabsContent>
          
          <TabsContent value="tasks">
            <MVPTaskManagement />
          </TabsContent>
        </Tabs>
      </div>
    </HousekeepingErrorBoundary>
  );
};

export default Housekeeping;
