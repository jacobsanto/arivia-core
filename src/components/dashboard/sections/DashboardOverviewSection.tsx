
import React from "react";
import { Button } from "@/components/ui/button";
import DashboardMetrics from "../DashboardMetrics";
import { EmptyState } from "@/components/ui/empty-state";
import { Database, Plus } from "lucide-react";
import { toast } from "sonner";

interface DashboardOverviewSectionProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: string | null;
  favoriteMetrics?: string[];
  onToggleFavorite?: (metricId: string) => void;
  onRefresh?: () => Promise<any>;
  onAddSampleData?: () => Promise<void>;
}

const DashboardOverviewSection: React.FC<DashboardOverviewSectionProps> = ({
  dashboardData,
  isLoading,
  error,
  favoriteMetrics,
  onToggleFavorite,
  onRefresh,
  onAddSampleData
}) => {
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

  // Check if we have any data
  const hasData = dashboardData && (
    dashboardData.properties || 
    dashboardData.tasks || 
    dashboardData.maintenance
  );

  if (hasData) {
    return (
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
          isLoading={isLoading || false}
          error={error}
          favoriteMetrics={favoriteMetrics}
          onToggleFavorite={onToggleFavorite}
        />
      </section>
    );
  }

  return (
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
  );
};

export default DashboardOverviewSection;
