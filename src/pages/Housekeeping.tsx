import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bed, BarChart3, Calendar, ListCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import components
import { HousekeepingDashboard } from "@/components/housekeeping/HousekeepingDashboard";
import { HousekeepingKanban } from "@/components/housekeeping/HousekeepingKanban";
import { HousekeepingCalendar } from "@/components/housekeeping/HousekeepingCalendar";
import { HousekeepingReports } from "@/components/housekeeping/HousekeepingReports";
import { CreateTaskModal } from "@/components/housekeeping/CreateTaskModal";
import { HousekeepingErrorBoundary } from "@/components/error-boundaries/HousekeepingErrorBoundary";

const Housekeeping: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const { user } = useAuth();
  
  const isManager = user?.role === "superadmin" || user?.role === "administrator" || user?.role === "property_manager";

  return (
    <HousekeepingErrorBoundary>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Helmet>
          <title>Housekeeping Operations - Arivia Villas</title>
          <meta name="description" content="Manage housekeeping tasks, schedules, and team operations efficiently" />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bed className="h-8 w-8 text-primary" />
              Housekeeping Operations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage room cleaning, laundry, and guest turnover tasks efficiently
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <ListCheck className="h-4 w-4" />
              Task Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            {isManager && (
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <HousekeepingDashboard />
          </TabsContent>
          
          <TabsContent value="kanban" className="mt-6">
            <HousekeepingKanban />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <HousekeepingCalendar />
          </TabsContent>
          
          {isManager && (
            <TabsContent value="reports" className="mt-6">
              <HousekeepingReports />
            </TabsContent>
          )}
        </Tabs>

        {/* Create Task Modal */}
        <CreateTaskModal 
          isOpen={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
    </HousekeepingErrorBoundary>
  );
};

export default Housekeeping;