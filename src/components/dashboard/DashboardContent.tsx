
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { guestyBookingSyncService } from "@/services/guesty/guestyBookingSyncService";
import { toast } from "sonner";
import CleaningRulesManager from "./CleaningRulesManager";
import DashboardMetrics from "./DashboardMetrics";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Database, Plus } from "lucide-react";

interface DashboardContentProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => Promise<any>;
  onAddSampleData?: () => Promise<void>;
  onBookingSync?: () => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData,
  isLoading,
  error,
  favoriteMetrics,
  onToggleFavorite,
  onRefresh,
  onAddSampleData,
  onBookingSync
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const handleBookingSync = async () => {
    setIsSyncing(true);
    try {
      toast.info("Starting Guesty booking sync...");
      const result = await guestyBookingSyncService.syncAllBookings();
      if (result.success) {
        toast.success(result.message);
        onBookingSync?.(); // Refresh bookings
        onRefresh?.(); // Refresh dashboard
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error syncing bookings:", error);
      toast.error("Failed to sync bookings");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSampleData = async () => {
    if (!onAddSampleData) return;
    
    try {
      await onAddSampleData();
      toast.success("Sample data added successfully");
    } catch (error) {
      console.error("Error adding sample data:", error);
      toast.error("Failed to add sample data");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          type="card" 
          count={6}
          text="Loading dashboard data..."
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>Failed to load dashboard: {error}</span>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if we have any data
  const hasData = dashboardData && (
    dashboardData.properties || 
    dashboardData.tasks || 
    dashboardData.maintenance
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Metrics Section */}
      {hasData ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dashboard Overview</h2>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh Data
              </Button>
            )}
          </div>
          <DashboardMetrics 
            data={dashboardData}
            isLoading={false}
            error={null}
            favoriteMetrics={favoriteMetrics}
            onToggleFavorite={onToggleFavorite}
          />
        </section>
      ) : (
        <section>
          <EmptyState
            icon={Database}
            title="No Dashboard Data Available"
            description="Start by adding properties, tasks, or maintenance records to see your metrics here."
            className="mx-auto max-w-md"
            action={onAddSampleData ? {
              label: "Add Sample Data",
              onClick: handleAddSampleData
            } : undefined}
          />
        </section>
      )}

      {/* Quick Actions Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your properties and bookings efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Bookings</h3>
              <p className="text-sm text-muted-foreground">
                Sync your Guesty bookings to keep your data up-to-date.
              </p>
              <Button onClick={handleBookingSync} disabled={isSyncing}>
                {isSyncing ? "Syncing..." : "Sync Bookings"}
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Calendar</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Cleaning Rules Manager Section */}
      <section>
        <CleaningRulesManager />
      </section>
    </div>
  );
};

export default DashboardContent;
